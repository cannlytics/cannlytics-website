"""

Description:

    At the beginning of each day, get the logs from the day
    before and send the admin a performance report.

"""
# Standard imports:
from datetime import datetime

# External imports:
from firebase_admin import auth, initialize_app, firestore


#-----------------------------------------------------------------------
# User Statistics
#-----------------------------------------------------------------------

def update_user_stats():
    """Update user statistics."""

    # Initialize Firestore.
    try:
        initialize_app()
    except ValueError:
        pass

    # Get user statistics.
    users = []
    monthly_users = 0
    start_of_month = datetime(datetime.now().year, datetime.now().month, 1)
    print('Getting user statistics...')
    page = auth.list_users()
    while page:
        for user in page.users:
            users.append(user)
            timestamp = user.user_metadata.creation_timestamp
            created_at = datetime.fromtimestamp(timestamp / 1000)
            if created_at >= start_of_month:
                monthly_users += 1
        page = page.get_next_page()
    number_of_users = len(users)
    print(f'Total number of users: {number_of_users}')
    print(f'Number of new users this month: {monthly_users}')

    # Get current user stats and see if there were any change in users.
    db = firestore.client()
    ref = db.collection('stats').document('users')
    current_user_stats = ref.get().to_dict()
    if current_user_stats is None:
        current_user_stats = {
            'total_users': 0,
            'monthly_users': 0,
        }

    # Calculate the daily change in users.
    updated_user_stats = {
        'total_users': number_of_users,
        'monthly_users': monthly_users,
    }
    updated_user_stats['change_in_users'] = updated_user_stats['total_users'] - current_user_stats['total_users']
    updated_user_stats['change_in_monthly_users'] = updated_user_stats['monthly_users'] - current_user_stats['monthly_users']

    # Update user stats if they changed.
    ref.set(updated_user_stats)
    print('Updated stats/users document.')

    # Return the updated user stats.
    return updated_user_stats


# === Test ===
# [✓] Tested: 2024-09-01 by Keegan Skeate <keegan@cannlytics>
if __name__ == '__main__':

    # Update user statistics.
    user_stats = update_user_stats()


#-----------------------------------------------------------------------
# Admin report
#-----------------------------------------------------------------------

# TODO: Get counts of data types.


# Optional: Get counts of logs.


# TODO: Read report template.


# TODO: Fill-in report template.


# TODO: Generate the report.
