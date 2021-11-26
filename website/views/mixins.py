"""
Mixins | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/30/2020
Updated: 11/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
from datetime import datetime

# External imports
from django.views.generic import TemplateView
from django.views.generic.base import ContextMixin
from django.http import HttpResponse

# Internal imports
from cannlytics.firebase import initialize_firebase, update_document
from website.state import state


class BaseMixin(ContextMixin):

    def get_template_names(self):
        """Get templates for a view based on the URL."""
        folder = 'website/pages'
        page = self.kwargs.get('page', 'homepage')
        section = self.kwargs.get('section', '')
        unit = self.kwargs.get('unit', '')
        templates = [
            f'{folder}/{page}.html',
            f'{folder}/{page}/{section}/{unit}.html',
            f'{folder}/{page}/{section}.html',
            f'{folder}/{page}/{page}.html',
            f'{folder}/general/{page}.html',
        ]
        # if section:
        #     templates.insert(0, f'{folder}/{page}/{section}.html')
        return templates


    def get_page_state(self, context):
        """Get screen-specific text."""
        key = self.kwargs.get('page', 'homepage')
        material = state.get(key)
        if material is not None:
            context[key] = material
        return context


    def save_analytics(self):
        """Save page analytics to Firestore."""
        now = datetime.now().isoformat()
        date = now[:10]
        values = {
            'date': date,
            'time': now,
            'page': self.request.path,
            'query': self.request.GET.get('q')
        }
        ref = f'logs/website/page_visits/{now}'
        update_document(ref, values)


    def get_context_data(self, **kwargs):
        """Get context that is used on all pages."""
        context = super(BaseMixin, self).get_context_data(**kwargs)
        context['general'] = state['general']
        context['header'] = state['header']
        context['footer'] = state['footer']
        context['page'] = self.kwargs.get('page', 'homepage')
        context['section'] = self.kwargs.get('section', '')
        context = self.get_page_state(context)
        initialize_firebase()
        self.save_analytics()
        return context


class TemplateView(TemplateView): #pylint:disable=function-redefined
    """
    Exactly like Django's TemplateView, but adds support for returning an
    HttpResponse in get_context_data.
    Source: https://gist.github.com/heyman/eec08ec0ed81df205e83
    """
    def get(self, request, *args, **kwargs):
        context_or_response = self.get_context_data(**kwargs)
        if isinstance(context_or_response, HttpResponse):
            return context_or_response
        else:
            return self.render_to_response(context_or_response)
