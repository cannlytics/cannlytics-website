"""
Mixins | Cannlytics Website
Created: 12/30/2020
"""
from datetime import datetime
from django.views.generic.base import ContextMixin
from cannlytics_website.state import state # Save text in Firestore?
from .firebase import update_document
from .utils import get_markdown

from firebase_admin import firestore

class BaseMixin(ContextMixin):

    def get_template_names(self):
        """Get templates for a view based on the URL."""
        folder = "cannlytics_website/pages"
        page = self.kwargs.get("page", "homepage")
        section = self.kwargs.get("section", "")
        templates = [
            f"{folder}/{page}.html",
            f"{folder}/{page}/{page}.html",
            f"{folder}/general/{page}.html",
        ]
        if section:
            templates.insert(0, f"{folder}/{page}/{section}.html")
        return templates

    def get_page_state(self, context):
        """Get screen-specific text."""
        key = self.kwargs.get("page", "homepage")
        material = state.get(key)
        if material is not None:
            context[key] = material
        return context

    def get_page_data(self, documents, collections=[]):
        """Get all Firestore data needed for a page."""
        return {}

    def save_analytics(self):
        """Save page analytics to Firestore."""
        now = datetime.now().isoformat()
        date = now[:10]
        values = {
            # TODO: Get as many data points as possible about the page visit.
            "date": date,
            "time": now,
            "page": self.request.path,
            "query": self.request.GET.get('q')
        }
        ref = f"website/logs/page_visits/{now}"
        update_document(ref, values)

    def get_context_data(self, **kwargs):
        """Get context that is used on all pages."""
        context = super(BaseMixin, self).get_context_data(**kwargs)
        context["general"] = state["general"]
        context["header"] = state["header"]
        context["footer"] = state["footer"]
        context["page"] = self.kwargs.get("page", "homepage")
        context["section"] = self.kwargs.get("section", "")
        context = self.get_page_state(context)

        # Optional: Get page data.

        # Optional: Somehow get page markdown.
        # app = How to get app name?
        # dir = Hot to get directory?
        # md = self.kwargs.get("page", "homepage")
        # context = get_markdown(context, app, dir, md)

        # PRODUCTION: Measure what pages people visit.
        # self.save_analytics()
        
        return context

