"""

Description:

    At the beginning of each day, get the logs from the day
    before and send the admin a performance report.

"""
from firebase_admin import auth, initialize_app


# Initialize app.
initialize_app()

# TODO: Get statistics:
# - Number of Cannlytics users.
users = []
page = auth.list_users()
while page:
    for user in page.users:
        users.append(user)
    page = page.get_next_page()
number_of_users = len(users)
print(f"Number of users: {number_of_users}")

# TODO: Get counts of data types.


# Optional: Get counts of logs.


# TODO: Read report template.


# TODO: Fill-in report template.


# TODO: Generate the report.
