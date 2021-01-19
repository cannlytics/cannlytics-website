from survey.models import Choice, Question
from django.utils import timezone

# Create a new Question.
q = Question(question_text="Will you tell me more?", pub_date=timezone.now())
q.save()

# Create three choices.
q.choice_set.create(choice_text="No thank you.", votes=0)
q.choice_set.create(choice_text="Absolutely.", votes=0)
q.choice_set.create(choice_text="Skip", votes=0)
