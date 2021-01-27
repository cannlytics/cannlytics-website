"""
Forms | Cannlytics Website
Created: 1/5/2021
"""
from django import forms
from django.core.mail import send_mail
from django.conf import settings
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
# from simplemathcaptcha.fields import MathCaptchaField


class ContactForm(forms.Form):

    name = forms.CharField(label="Name", required=False)
    sender = forms.EmailField(label="Email", required=False)
    subject = forms.CharField(label="Subject", max_length=100, required=True)
    message = forms.CharField(
        label="Message or short description of your project",
        required=True,
        widget=forms.Textarea,
    )
    cc_myself = forms.BooleanField(label="Receive a copy", required=False)
    # captcha = MathCaptchaField() # FIXME: ImportError: cannot import name 'six' from 'django.utils'

    def __init__(self, *args, **kwargs):
        """ Control how the form is rendered. """
        super().__init__(*args, **kwargs)
        submit_button = Submit('submit', 'Send mail', css_class='bg-gradient-green no-border')
        self.helper = FormHelper()
        self.helper.form_id = 'contact-form'
        self.helper.form_method = 'post'
        self.helper.form_action = 'contact'
        self.helper.add_input(submit_button)

    def send_email(self):
        """ Send contact form email. """
        name = self.cleaned_data['name']
        subject = self.cleaned_data['subject']
        message = self.cleaned_data['message']
        sender = self.cleaned_data['sender']
        cc_myself = self.cleaned_data['cc_myself']
        recipients = settings.LIST_OF_EMAIL_RECIPIENTS
        if not sender:
            sender = settings.DEFAULT_FROM_EMAIL
        if cc_myself:
            recipients.append(sender)
        text = "New message through cannlytics.com"
        text += "\n\n{0}".format(message)
        if name is not None:
            text += '\n\nFrom,\n' + str(name)
        # Optional: Format HTML email
        # msg_html = render_to_string('contact_email.html', {'message': message, 'name': name})
        send_mail(
            subject=subject.strip(),
            message=text,
            from_email=sender,
            recipient_list=recipients,
            fail_silently=False,
            # html_message=html_message
        )
        pass


class LoginForm(forms.Form):

    email = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

    def sign_in(self):
        # TODO: Login in the user
        print("Loging in user")
        print(self.cleaned_data)
        pass
