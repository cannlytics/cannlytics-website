"""
Get Function Logs
Copyright (c) 2023 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 10/24/2023
Updated: 12/28/2023
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime, timedelta
import os

# External imports:
import google.auth
from google.cloud import logging_v2
from google.cloud.logging_v2 import DESCENDING
import pandas as pd


def get_function_logs(
        function_name,
        project_id=None,
        service_type='cloud_function',
        start_time=None,
        end_time=None,
    ):
    """
    Retrieves logs from a specific Cloud Function or Cloud Run service
    within a specified time range and organizes them into a DataFrame.

    Args:
        function_name (str): Name of the service to filter logs.
        project_id (str, optional): Project ID of the service.
        service_type (str, optional): Type of service to filter logs. Defaults to "cloud_function". Specify any other value to get Cloud Run services.
        start_time (datetime, optional): Datetime object representing the start time 
            to begin fetching logs. Defaults to None, which will be interpreted as 
            24 hours before the current time.
        end_time (datetime, optional): Datetime object representing the end time to 
            stop fetching logs. Defaults to None, which will be interpreted as the 
            current time.
            
    Returns:
        DataFrame: A pandas DataFrame containing the logs with necessary information 
            such as timestamp, protocol, latency, etc.
    """
    # Initialize the Cloud Logging Client.
    client = logging_v2.Client()
    if project_id is None:
        _, project_id = google.auth.default()

    # Define the time range.
    if not start_time:
        start_time = datetime.now() - timedelta(days=1)
    if not end_time:
        end_time = datetime.now()

    # Convert times to strings.
    start_str = start_time.strftime('%Y-%m-%dT%H:%M:%SZ')
    end_str = end_time.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Define the filter based on service type.
    if service_type == 'cloud_function':
        filter_str = f"resource.type=\"cloud_function\" AND resource.labels.function_name=\"{function_name}\" AND timestamp >= \"{start_str}\" AND timestamp <= \"{end_str}\""
    else:
        filter_str = f"resource.labels.service_name = \"{function_name}\" AND timestamp >= \"{start_str}\" AND timestamp <= \"{end_str}\""
    
    # Fetch and process logs.
    entries = list(client.list_entries(order_by=DESCENDING, filter_=filter_str))
    
    # Extract pertinent log information.
    logs_data = []
    for entry in entries:
        http_request = entry.http_request or {}
        logs_data.append({
            'timestamp': entry.timestamp,
            'text': entry.payload,
            'protocol': http_request.get('protocol'),
            'latency': http_request.get('latency'),
            'remote_ip': http_request.get('remoteIp'),
            'user_agent': http_request.get('userAgent'),
            'response_size': http_request.get('responseSize'),
            'request_size': http_request.get('requestSize'),
            'method': http_request.get('requestMethod'),
            'url': http_request.get('requestUrl').replace('https://cannlytics-website-deeuhexjlq-uc.a.run.app', '') if http_request.get('requestUrl') else None,
        })
        
    # Return as DataFrame
    return pd.DataFrame(logs_data)


# === Tests ===
if __name__ == '__main__':

    # Define where to save the logs.
    log_dir = 'D://data/.logs/cannlytics-website'
    os.makedirs(log_dir, exist_ok=True)

    # Define the time range for the logs.
    start_time = datetime(2024, 12, 22)
    end_time = datetime(2024, 12, 28)

    # Define functions.
    cloud_functions = [
        # ('cannlytics-website', 'cloud_run'), # FIXME: This resource has many logs and needs a shorter time span or other adjustments.
        ('auth_signup', 'cloud_function'),
        ('calc_results_stats', 'cloud_function'),
        ('calc_spending_stats', 'cloud_function'),
        ('calc_strain_stats', 'cloud_function'),
        ('parse_coa_jobs', 'cloud_function'),
        ('parse_receipt_jobs', 'cloud_function'),
    ]

    # Get logs for each function.
    for function_name, service_type in cloud_functions:
        df = get_function_logs(
            function_name,
            service_type=service_type,
            start_time=start_time,
            end_time=end_time,
        )
        if len(df) == 0:
            print(f'No logs found: `{function_name}`')
            continue
        outfile = os.path.join(log_dir, f'logs-{function_name}-{start_time.strftime("%Y-%m-%d")}-to-{end_time.strftime("%Y-%m-%d")}.csv')
        df.to_csv(outfile, index=False)
        print(f'Saved {len(df)} `{function_name}` logs: {outfile}')
