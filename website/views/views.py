"""
Main Views | Cannlytics Website
Copyright (c) 2021-2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 12/29/2020
Updated: 9/15/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports:
from django.http.response import HttpResponseRedirect
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView

# Internal imports:
from website.views.mixins import BaseMixin
from website.views.texts import get_page_texts
from website.state import company_context


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GeneralView(BaseMixin, TemplateView):
    """Generic view for most pages."""

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context = get_page_texts(self.request, context)
        return context


def handler404(request, *args, **argv): #pylint: disable=unused-argument
    """Handle missing pages."""
    template = 'pages/general/errors/404.html'
    return render(request, template, {}, status=404)


def handler500(request, *args, **argv): #pylint: disable=unused-argument
    """Handle internal errors."""
    template = 'pages/general/errors/500.html'
    return render(request, template, {}, status=500)


def meetup(request): #pylint: disable=unused-argument
    """Redirect the user to the Cannabis Data Science meetup."""
    return HttpResponseRedirect(company_context['meetup_url'])


def donate(request): #pylint: disable=unused-argument
    """Redirect the Cannlytics donate page."""
    return HttpResponseRedirect(company_context['donation_url'])
