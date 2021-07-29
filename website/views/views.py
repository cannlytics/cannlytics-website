"""
Views | Cannlytics Website

Author: Keegan Skeate <keegan@cannlytics.com>
Created: 12/29/2020
Updated: 7/27/2021
"""
# Standard imports
import os

# External imports
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic.edit import FormView

# Internal imports
from website.forms import ContactForm
from website.state import lab_state, page_data, page_docs, state
from website.views.mixins import BaseMixin, TemplateView
from website.utils.firebase import get_document, get_collection
from website.utils.utils import get_markdown

APP = 'website'
FILE_PATH = os.path.dirname(os.path.realpath(__file__))


class GeneralView(BaseMixin, TemplateView):
    """Generic view for most pages."""

    def get_data(self, context):
        """Get all data for a page from Firestore."""
        if context["section"]:
            data = page_data.get(context['section'])
        else:
            data = page_data.get(context['page'])
        if data is None:
            return context
        documents = data.get('documents')
        collections = data.get('collections')
        if documents:
            for item in documents:
                context[item['name']] = get_document(item['ref'])
        if collections:
            for item in collections:
                context[item['name']] = get_collection(
                    item['ref'],
                    limit=item.get('limit'),
                    order_by=item.get('order_by'),
                    desc=item.get('desc'),
                    filters=item.get('filters'),
                )
        return context

    def get_docs(self, context):
        """Get the text documents for a given page."""
        docs = page_docs.get(context['page'])
        if docs:
            for doc in docs:
                name = doc.replace('-', '_')
                context = get_markdown(
                    self.request, context, APP, FILE_PATH, doc, name=name
                )
        return context

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context = self.get_data(context)
        context = self.get_docs(context)
        return context


class CommunityView(BaseMixin, TemplateView):
    """Community page."""

    def get_template_names(self):
        return [f'{APP}/pages/community/community.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        credentials = get_document('admin/google')
        api_key = credentials['public_maps_api_key']
        context['api_key'] = [api_key]
        return context


class ContactView(BaseMixin, FormView):
    """Form view for contact."""

    form_class = ContactForm
    success_url = '/contact/thank-you/'

    def get_template_names(self):
        return [f'{APP}/pages/contact/contact.html']

    def form_valid(self, form):
        """Submit the contact form."""
        form.send_email()
        return super(ContactView, self).form_valid(form)
    
    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        # FIXME: Would be preferable to get in BaseMixin
        context['contact'] = state['contact']
        return context


class LabView(BaseMixin, TemplateView):
    """View for lab detail pages."""

    def get_template_names(self):
        return [f"{APP}/pages/community/labs/lab.html"]

    def get_lab_data(self, context):
        """Get a lab's data from Firestore."""
        slug = self.kwargs.get("lab")
        filters = [{'key': 'slug', 'operation': '==', 'value': slug}]
        labs = get_collection("labs", filters=filters)
        if labs:
            context['lab'] = labs[0]
        else:
            context['lab'] = {}
        return context

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context = self.get_lab_data(context)
        context['fields'] = lab_state['detail_fields']
        context['tabs'] = lab_state['tabs']
        return context


class NewLabView(BaseMixin, TemplateView):
    """View for adding a lab."""

    def get_template_names(self):
        return [f'{APP}/pages/community/labs/new.html']

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context['fields'] = lab_state['detail_fields']
        context['tabs'] = lab_state['tabs'][:2]
        return context


class VideosView(BaseMixin, TemplateView):
    """Videos page."""

    def get_template_names(self):
        return [f'{APP}/pages/videos/videos.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['video_archive'] = get_collection(
            'public/videos/video_data',
            limit=10,
            order_by='published_at',
            desc=True,
        )
        return context


def handler404(request, *args, **argv): #pylint: disable=unused-argument
    """Handle missing pages."""
    template = f'{APP}/pages/general/errors/404.html'
    return render(request, template, {}, status=404)


def handler500(request, *args, **argv): #pylint: disable=unused-argument
    """Handle internal errors."""
    template = f'{APP}/pages/general/errors/500.html'
    return render(request, template, {}, status=500)
