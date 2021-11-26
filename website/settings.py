"""
Django Project Settings | Cannlytics Website
Copyright (c) 2021 Cannlytics

Author: Keegan Skeate <keegan@cannlytics.com>
Created: 1/5/2021
Updated: 7/27/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>

Django settings powered by environment variables and
secured by Google Cloud Secret Manager.
"""
# Standard imports
import json
import io
import os
import re

# External imports
import environ
import google.auth
from google.cloud import secretmanager
from django.template import base

# ------------------------------------------------------------#
# Project variables.
# ------------------------------------------------------------#
PRODUCTION = False  # PRODUCTION: Change from False to True
PROJECT_NAME = 'website'
ROOT_URLCONF = 'website.urls'
SETTINGS_NAME = 'cannlytics_website_settings'
WSGI_APPLICATION = 'website.core.wsgi.application'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Get the version number.
with open(os.path.join(BASE_DIR, 'package.json')) as v_file:
    package = json.loads(v_file.read())
    APP_VERSION_NUMBER = package['version']

# ------------------------------------------------------------#
# Environment variables.
# Pulling django-environ settings file, stored in Secret Manager.
# Docs: https://cloud.google.com/secret-manager/docs/overview
# Example: https://codelabs.developers.google.com/codelabs/cloud-run-django
# ------------------------------------------------------------#

# Load secrets stored as environment variables.
env = environ.Env(DEBUG=(bool, False))
env_file = os.path.join(BASE_DIR, '.env')

# Attempt to load the Project ID into the environment, safely failing on error.
try:
    _, os.environ['GOOGLE_CLOUD_PROJECT'] = google.auth.default()
# except google.exceptions.DefaultCredentialsError:
except:
    pass

# Use a local secret file, if provided.
if os.path.isfile(env_file):
    env.read_env(env_file)

# Retrieve the .env from Secret Manager.
elif os.environ.get('GOOGLE_CLOUD_PROJECT', None):
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT')
    client = secretmanager.SecretManagerServiceClient()
    name = f'projects/{project_id}/secrets/{SETTINGS_NAME}/versions/latest'
    payload = client.access_secret_version(name=name).payload.data.decode('UTF-8')
    env.read_env(io.StringIO(payload))
else:
    raise Exception('No local .env or GOOGLE_CLOUD_PROJECT detected. No secrets found.')

# Access the secret key.
SECRET_KEY = env('SECRET_KEY')

# Ensure PRODUCTION is set to True in your .env when publishing!
try:
    PRODUCTION = env('PRODUCTION')
except:
    PRODUCTION = 'True'
    DEBUG = False
if PRODUCTION == 'True':
    DEBUG = False
else:
    DEBUG = True

# ------------------------------------------------------------#
# Apps
# https://docs.djangoproject.com/en/3.1/ref/applications/
# ------------------------------------------------------------#
INSTALLED_APPS = [
    'website',
    'crispy_forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_feather',
    'django_robohash',
]

CRISPY_TEMPLATE_PACK = 'bootstrap4'

# ------------------------------------------------------------#
# Middleware
# https://docs.djangoproject.com/en/3.1/topics/http/middleware/
# ------------------------------------------------------------#
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ------------------------------------------------------------#
# Livereload
# https://github.com/tjwalch/django-livereload-server
# ------------------------------------------------------------#
if PRODUCTION == 'False':
    INSTALLED_APPS.insert(0, 'livereload')
    MIDDLEWARE.insert(0, 'livereload.middleware.LiveReloadScript')
    MIDDLEWARE_CLASSES = 'livereload.middleware.LiveReloadScript'

# ------------------------------------------------------------#
# Templates
# https://docs.djangoproject.com/en/3.1/ref/templates/language/
# ------------------------------------------------------------#
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'website/templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ------------------------------------------------------------#
# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators
# ------------------------------------------------------------#
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
    },
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ------------------------------------------------------------#
# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/
# ------------------------------------------------------------#
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Los_Angeles'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# ------------------------------------------------------------#
# Security
# https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/web_application_security
# ------------------------------------------------------------#
ALLOWED_HOSTS = ['*']
try:
    ALLOWED_HOSTS.append(env('CUSTOM_DOMAIN'))
except:
    pass
try:
    ALLOWED_HOSTS.append(env('FIREBASE_HOSTING_URL'))
except:
    pass
try:
    ALLOWED_HOSTS.append(env('CLOUD_RUN_URL'))
except:
    pass

if PRODUCTION == 'False':
    ALLOWED_HOSTS.extend(['*', 'localhost:8000', '127.0.0.1'])

SECURE_SSL_REDIRECT = False

# ------------------------------------------------------------#
# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases
# ------------------------------------------------------------#
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# ------------------------------------------------------------#
# Email
# https://docs.djangoproject.com/en/3.1/topics/email/
# ------------------------------------------------------------#
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = '587'
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = env('EMAIL_HOST_USER')
LIST_OF_EMAIL_RECIPIENTS = [env('EMAIL_HOST_USER')]

# ------------------------------------------------------------#
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/
# ------------------------------------------------------------#

# List of directories where Django will also look for static files
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'website/static'),
)

# The directory from where files are served. (web accessible folder)
STATIC_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'public/static')
)

# The relative path to serve files.
STATIC_URL = '/static/'

# ------------------------------------------------------------#
# Sessions
# https://docs.djangoproject.com/en/3.1/topics/http/sessions/
# ------------------------------------------------------------#

# Enable Django's session engine for storing user sessions.
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'

# Whether to expire the session when the user closes their browser.
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# The age of session cookies, in seconds. (Currently: 14 days)
SESSION_COOKIE_AGE = 60 * 60 * 24 * 14

# ------------------------------------------------------------#
# Customization
# ------------------------------------------------------------#

# Remove trailing slash from URLs.
# APPEND_SLASH = False

# Allow Django template tags to span multiple lines.
# https://stackoverflow.com/questions/49110044/django-template-tag-on-multiple-line
base.tag_re = re.compile(base.tag_re.pattern, re.DOTALL)
