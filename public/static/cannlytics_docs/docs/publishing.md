# Publishing

Authenticate with Google Cloud with `gcloud auth application-default login`.

As the Cannlytics Website runs on Google Cloud, a service account is used to access resources. Please see:

* [Setting Google Application Credentials Securely](https://stackoverflow.com/questions/57141348/set-google-application-credentials-securely)
* [Article on Cloud Run Identity](https://www.jhanley.com/google-cloud-run-identity/)

Before publishing, ensure all static files are collected with `python manage.py collectstatic`.

1. First, build the container image.

```shell

gcloud builds submit --tag gcr.io/cannlytics/cannlytics-website

```

2. Run the migrations for static or database alterations.

```shell

gcloud builds submit --config cloudmigrate.yaml --substitutions _REGION=us-central1

```

3. Deploy to Cloud Run.

```shell

gcloud run deploy cannlytics-website --platform managed --region us-central1 --image gcr.io/cannlytics/cannlytics-website --allow-unauthenticated --service-account=${GCS_SA}

```
    
> If using Postgre SQL, add the tags `--add-cloudsql-instances cannlytics:us-central1:cannlytics-sql`.

Resources:

* [Cloud Run FAQ](https://github.com/ahmetb/cloud-run-faq)
* [Deployment Checklist](https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/)
* [Deploying Django on Cloud Run](https://codelabs.developers.google.com/codelabs/cloud-run-django)
* [Deploying Static Files](https://docs.djangoproject.com/en/3.1/howto/static-files/deployment/)
* [Google Cloud Storage with Django](https://django-storages.readthedocs.io/en/latest/backends/gcloud.html)
* [Reusable apps](https://docs.djangoproject.com/en/3.1/intro/reusable-apps/)
* [Deploying Static Files](https://docs.djangoproject.com/en/3.1/howto/static-files/deployment/)
* [Django on Cloud Run](https://codelabs.developers.google.com/codelabs/cloud-run-django/index.html)
* [Google Cloud Storage with Django](https://django-storages.readthedocs.io/en/latest/backends/gcloud.html)
* [Reusable apps](https://docs.djangoproject.com/en/3.1/intro/reusable-apps/)
* [Running Django on Google Cloud Run with CloudSQL](https://medium.com/@lhennessy/running-django-on-google-cloud-run-with-cloudsql-ac8141095b77)
