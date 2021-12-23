"""
URLs | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/29/2020
Updated: 11/26/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports.
from django.conf import settings
from django.conf.urls import handler404, handler500 #pylint: disable=unused-import
from django.contrib import admin
from django.urls import include, path
from django_robohash.views import robohash

# Internal imports.
from website.views import (
    api,
    auth,
    data,
    email,
    labs,
    main,
    videos,
)

# FIXME: Fix all broken links.

# 404:
    # /robots.txt/
    # /ads.txt/

# 500 errors:
    # /subscribe/

# Broken API endpoints:
    # /api/labs/

# Missing pages:
    # /docs/website/publishing/
    # /docs/
    # docs/app/get-started/
    # /docs/website/installation/contributing/
    # /docs/website/publishing/
    # /docs/website/architecture
    # /docs/api/regulations/
    # /docs/api/instruments/
    # /docs/api/authentication/
    # /docs/lims/get-started/
    # /docs/api/labs/
    # /docs/console/installation/
    # /docs/api/limits/
    # /docs/about/faq/
    # /docs/api/lab_results/

# TODO: Redirects from old pages to stable links.
# https://stackoverflow.com/questions/35903832/how-to-redirect-to-external-url-in-django
# urlpatterns += [
#     path('docs/', include([
#         path('', api.labs),
#         path('labs/', api.labs),
#     ])),
# ]

# Main URLs.
urlpatterns = [
    path('', main.GeneralView.as_view(), name='index'),
    path('admin', admin.site.urls, name='admin'),
    path('api/', include([
        path('internal/login', auth.login),
        path('internal/logout', auth.logout),
        path('internal/promotions', data.promotions, name='promotions'),
        path('internal/send-message', email.send_message),
        path('internal/subscribe', data.subscribe, name='subscribe'),
        path('internal/subscriptions', api.get_user_subscriptions, name='subscriptions'),
        path('data/buy', data.buy_data),
        path('data/publish', data.publish_data),
        path('data/sell', data.sell_data),
        path('labs', api.labs),
        path('labs/<uuid:org_id>', api.labs),
        path('labs/<uuid:org_id>/analyses', api.lab_analyses),
        path('labs/<uuid:org_id>/logs', api.lab_logs),
        path('labs/download', data.download_lab_data),
        # TODO: Add regulations / limits pages.
        # TODO: Add analyte pages.
        # TODO: Add analysis / prices pages.
    ])),
    path('community', labs.CommunityView.as_view(), name='community'),
    path('labs', labs.CommunityView.as_view(), name='labs'),  # Redundant?
    path('labs/new', labs.NewLabView.as_view()),
    path('labs/<lab>', labs.LabView.as_view()),
    # TODO: Add analyses and prices to lab pages.
    path('robohash/<string>', robohash, name='robohash'),
    path('videos', videos.VideosView.as_view(), name='videos'),
    path('videos/<video_id>', videos.VideosView.as_view(), name='video'),
    path('<page>', main.GeneralView.as_view(), name='page'),
    path('<page>/<section>', main.GeneralView.as_view(), name='section'),
    path('<page>/<section>/<str:unit>', main.GeneralView.as_view()),
]

# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static #pylint: disable=ungrouped-imports
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Error pages.
handler404 = 'website.views.main.handler404' #pylint: disable=invalid-name
handler500 = 'website.views.main.handler500' #pylint: disable=invalid-name
