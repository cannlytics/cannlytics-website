"""
Laboratory Views | Cannlytics Website

Author: Keegan Skeate <keegan@cannlytics.com>
Created: 11/15/2021
Updated: 11/15/2021
"""
# Standard imports
import os

# Internal imports
from cannlytics.firebase import get_document, get_collection
from website.state import lab_state
from website.views.mixins import BaseMixin, TemplateView


APP = 'website'
FILE_PATH = os.path.dirname(os.path.realpath(__file__))


class CommunityView(BaseMixin, TemplateView):
    """Community page."""

    def get_template_names(self):
        return ['website/pages/community/community.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        credentials = get_document('admin/google')
        api_key = credentials['public_maps_api_key']
        context['api_key'] = [api_key]
        return context


class LabView(BaseMixin, TemplateView):
    """View for lab detail pages."""

    def get_template_names(self):
        return ['website/pages/community/labs/lab.html']

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
        return ['website/pages/community/labs/new.html']

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context['fields'] = lab_state['detail_fields']
        context['tabs'] = lab_state['tabs'][:2]
        return context
