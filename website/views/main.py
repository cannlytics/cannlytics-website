"""
Main Views | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/29/2020
Updated: 11/15/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
import os

# External imports
from django.shortcuts import render

# Internal imports
from cannlytics.firebase import get_document, get_collection
from website.settings import PROJECT_NAME
from website.state import page_data, page_docs
from website.views.mixins import BaseMixin, TemplateView
from website.utils.utils import get_markdown

FILE_PATH = os.path.dirname(os.path.realpath(__file__))


class GeneralView(BaseMixin, TemplateView):
    """Generic view for most pages."""

    def get_data(self, context):
        """Get all data for a page from Firestore."""
        namespaces = []
        try:
            namespace = context['page']
            namespaces.append(page_data[namespace])
        except KeyError:
            pass
        try:
            namespace = context['section']
            namespaces.append(page_data[namespace])
        except KeyError:
            pass
        for namespace in namespaces:
            try:
                documents = namespace['documents']
                for item in documents:
                    context[item['name']] = get_document(item['ref'])
            except KeyError:
                pass
            try:
                collections = namespace['collections']
                for item in collections:
                    context[item['name']] = get_collection(
                        item['ref'],
                        limit=item.get('limit'),
                        order_by=item.get('order_by'),
                        desc=item.get('desc'),
                        filters=item.get('filters'),
                    )
            except KeyError:
                pass
        return context
        # if context['section']:
        #     data = page_data.get(context['section'])
        # else:
        #     data = page_data.get(context['page'])
        # if data is None:
        #     return context
        # documents = data.get('documents', [])
        # collections = data.get('collections', [])
        # for item in documents:
        #     context[item['name']] = get_document(item['ref'])
        # for item in collections:
        #     context[item['name']] = get_collection(
        #         item['ref'],
        #         limit=item.get('limit'),
        #         order_by=item.get('order_by'),
        #         desc=item.get('desc'),
        #         filters=item.get('filters'),
        #     )
        # return context

    def get_docs(self, context):
        """Get the text documents for a given page."""
        docs = page_docs.get(context['page'])
        if docs:
            for doc in docs:
                name = doc.replace('-', '_')
                context = get_markdown(
                    self.request,
                    context,
                    PROJECT_NAME,
                    FILE_PATH,
                    page=doc,
                    name=name,
                )
        return context

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context = self.get_data(context)
        context = self.get_docs(context)
        return context


def handler404(request, *args, **argv): #pylint: disable=unused-argument
    """Handle missing pages."""
    template = 'website/pages/general/errors/404.html'
    return render(request, template, {}, status=404)


def handler500(request, *args, **argv): #pylint: disable=unused-argument
    """Handle internal errors."""
    template = 'website/pages/general/errors/500.html'
    return render(request, template, {}, status=500)
