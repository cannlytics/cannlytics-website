"""
URLs | Cannlytics Website
Created: 12/29/2020
Resources: https://docs.djangoproject.com/en/3.1/topics/http/urls/
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from cannlytics_website import api, views

# Main URLs
urlpatterns = [
    path("", views.GeneralView.as_view(), name="index"),
    path("admin/", admin.site.urls, name="admin"),
    path("contact/", views.ContactView.as_view(), name="contact"),
    path("community/", views.CommunityView.as_view(), name="community"),
]

# TODO: Payments
urlpatterns += [
    path("subscribe/", api.subscribe, name="subscribe"),
    # path("checkout/", views.CheckoutView.as_view(), name="checkout"),
]

# Apps
urlpatterns += [
    path("docs/", include("cannlytics_docs.urls"), name="docs"),
    # path("portal/", include("cannlytics_portal.urls"), name="portal"),
    # TODO: API
        # /regulations
        # /instruments
        # /analytes
        # /instruments
        # /labs
]

# General pages
urlpatterns += [
    path("<slug:page>/", views.GeneralView.as_view(), name="page"),
    path("<slug:page>/<slug:section>/", views.GeneralView.as_view(), name="section"),
]

# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )

# https://stackoverflow.com/questions/5836674/why-does-debug-false-setting-make-my-django-static-files-access-fail
# url(r'^media/(?P<path>.*)$', serve,{'document_root': settings.MEDIA_ROOT}), 
# url(r'^static/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT}), 


#------------------------------------------------------------#
# Dev
#------------------------------------------------------------#

# Authentication
# https://docs.djangoproject.com/en/3.1/topics/auth/default/#user-objects
# urlpatterns += [
#     path("account/", include("cannlytics_auth.urls"), name="auth"),
#     # Optional: Add Django Authentication
#     # path('accounts/', include('django.contrib.auth.urls')),
#     # path('accounts/login/', auth_views.LoginView.as_view(template_name='cannlytics_website/login.html')),
#     # path('change-password/', auth_views.PasswordChangeView.as_view()),
# ]
