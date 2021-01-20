"""
Views | Cannlytics Docs
Created: 12/30/2020
"""
import os
# from django.shortcuts import redirect
from django.views.generic.base import TemplateView

from .state import state # Optional: Read documentation state from Firestore

from utils.mixins import BaseMixin
from utils.utils import get_markdown

APP = "cannlytics_docs"
FILE_PATH = os.path.dirname(os.path.realpath(__file__))

# Optional: Use RedirectViews?
# from django.views.generic import RedirectView

# def base_redirect(request):
#     """ Redirect user to a starting doc page. """
#     return redirect("cannlytics_docs:doc", product="lims")


# def section_redirect(request, product):
#     """ Redirect user to a starting section. """
#     # product = request.path
#     # print('\n\nPRODUCT:', product)
#     return redirect("cannlytics_docs:doc", product=product, section="get-started")


class CannlyticsDocsView(BaseMixin, TemplateView):

    def get_template_names(self):
        if self.kwargs.get("product"):
            return[f"{APP}/docs_page.html"]
        else:
            return[f"{APP}/docs_dashboard.html"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["index"] = state["index"]
        context["product"] = self.kwargs.get("product")
        if context["product"]:
            context["section"] = self.kwargs.get("section", "get-started")
            page = f"{context['product']}/{context['section']}"
            context = get_markdown(self.request, context, APP, FILE_PATH, page)
        return context
