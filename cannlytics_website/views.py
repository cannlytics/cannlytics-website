"""
Views | Cannlytics Website
Created: 12/29/2020
"""
import os
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView
from cannlytics_website.forms import ContactForm
from utils.firebase import get_document, get_collection
from utils.mixins import BaseMixin
from utils.utils import get_markdown

APP = "cannlytics_website"

DATA = {
    # TODO: Get community data more efficiently? Client-side?
    # "community": {
    #     "documents": [],
    #     "collections": [
    #         {"name": "labs", "ref": "public/labs"},
    #         {"name": "packages", "ref": "community/public/packages"},
    #     ],
    # },
    "contributors": {
        "collections": [{"name": "contributors", "ref": "contributors"}],
    },
    "products": {
        "collections": [{"name": "products", "ref": "products"}],
    },
    "partners": {
        "collections": [{"name": "partners_list", "ref": "partners"}],
    },
    "team": {
        "collections": [{"name": "team", "ref": "team"}],
    },
    "whitepapers": {
        "collections": [{"name": "whitepapers", "ref": "whitepapers"}],
    }
}

DOCS = {
    "about": ["about"],
    "contributors": ["contribute"],
    "privacy-policy": ["privacy-policy"],
    "terms-of-service": ["terms-of-service"],
    "roadmap": ["roadmap"],
}

FILE_PATH = os.path.dirname(os.path.realpath(__file__))
# FILE_PATH = os.path.dirname(__file__)


class GeneralView(BaseMixin, TemplateView):
    """Generic view for most pages."""
    
    def get_data(self, context):
        """Get all data for a page from Firestore."""
        if context["section"]:
            data = DATA.get(context["section"])
        else:
            data = DATA.get(context["page"])
        if data is None:
            return context
        documents = data.get("documents")
        collections = data.get("collections")
        if documents:
            for item in documents:
                context[item["name"]] = get_document(item["ref"])
        if collections:
            for item in collections:
                context[item["name"]] = get_collection(
                    item["ref"],
                    limit=item.get("limit"),
                    order_by=item.get("order_by"),
                    desc=item.get("desc"),
                    filters=item.get("filters")
                )
        return context

    def get_docs(self, context):
        """ Get text documents for a given page. """
        page_docs = DOCS.get(context["page"])
        if page_docs:
            for doc in page_docs:
                name = doc.replace('-', '_')
                context = get_markdown(self.request, context, APP, FILE_PATH, doc, name=name)
        return context

    def get_context_data(self, **kwargs):
        """Get the context for a page."""
        context = super().get_context_data(**kwargs)
        context = self.get_data(context)
        context = self.get_docs( context)
        return context


class CommunityView(BaseMixin, TemplateView):
    """Community page. """

    def get_template_names(self):
        return[f"{APP}/pages/community/community.html"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # FIXME: Passing API key does not work for some reason.
        api_key = get_document('admin/google')["cannlytics_lab_locator_api_key"]
        labs = get_collection('labs', limit=250, order_by='state')
        context["api_key"] = api_key
        context["labs"] = labs
        context["locations"] = [
            [l['name'], l['latitude'], l['longitude'], i]
            for i, l in enumerate(context["labs"])
        ]
        # TODO: Parse markdown?
        # TODO: Get packages from Firestore
        return context


class ContactView(BaseMixin, FormView):
    """Form view for contact."""

    form_class = ContactForm
    success_url = "/contact/thank-you/"

    def get_template_names(self):
        """Get the template."""
        return[f"{APP}/pages/contact/contact.html"]

    def get_context_data(self, **kwargs):
        """Get the context for the page."""
        context = super().get_context_data(**kwargs)
        return context

    def form_valid(self, form):
        """Submit the form."""
        form.send_email()
        return super(ContactView, self).form_valid(form) 

