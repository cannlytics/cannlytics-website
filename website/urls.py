"""
URLs | Cannlytics Website
Copyright (c) 2020-2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 12/29/2020
Updated: 10/4/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports:
from django.conf import settings
from django.conf.urls import handler404, handler500
from django.urls import include, path
from django.views.generic.base import RedirectView

# Internal imports:
from website.views import (
    auth,
    contact,
    payments,
    stats,
    views,
)


# Main URLs.
urlpatterns = [
    path('', views.GeneralView.as_view(), name='index'),
    path('api/', include('api.urls'), name='api'),
    path('src/', include([
        path('auth/login', auth.login),
        path('auth/logout', auth.logout),
        path('payments/subscriptions', payments.get_user_subscriptions),
        path('payments/unsubscribe', payments.unsubscribe),
        path('payments/orders', payments.create_order, name='create_order'),
        path('payments/orders/<str:order_id>/capture', payments.capture_order, name='capture_order'),
        path('message', contact.send_message, name='send_message'),
        path('report', contact.report_data, name='report_data'),
        path('star', stats.star_observation, name='star_observation'),
        path('vote', stats.vote_observation, name='vote_observation'),
    ])),
    path('donate', views.donate, name='donate'),
    path('meetup', views.meetup, name='meetup'),
    path('pricing', RedirectView.as_view(url='/account/subscriptions', permanent=False)),
    path('subscriptions', RedirectView.as_view(url='/account/subscriptions', permanent=False)),
    path('.well-known/ai-plugin.json', RedirectView.as_view(url='/static/ai-plugin.json', permanent=False)),
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=False)),
    path('robots.txt', RedirectView.as_view(url='/static/robots.txt', permanent=False)),
    path('<page>', views.GeneralView.as_view(), name='page'),
    path('<page>/<section>', views.GeneralView.as_view(), name='section'),
    path('<page>/<section>/<str:unit>', views.GeneralView.as_view(), name='unit'),
]


# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static #pylint: disable=ungrouped-imports
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Error pages.
handler404 = 'website.views.views.handler404' #pylint: disable=invalid-name
handler500 = 'website.views.views.handler500' #pylint: disable=invalid-name
