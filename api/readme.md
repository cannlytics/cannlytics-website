# The Cannlytics API

The Cannlytics API allows users to integrate with all of the functionality that Cannlytics has to offer. The Cannlytics API endpoints are simply an interface to the logic implemented in the `cannlytics` module. The API endpoints handle authentication, error handling, and identifying the precise logic to perform.

## Get Started with the Cannlytics API

Start making requests to the Cannlytics API by following these 3 quick steps.

1. First, [create a Cannlytics account](https://cannlytics.com/account/sign-up).
2. Second, [create an API key](https://cannlytics.com/account/api-keys) in the Cannlytics Console.
3. Finally, you can begin making requests to the Cannlytics API by sending your API Key in an `Authorization: Bearer <token>` header in your requests.

## API Data Endpoints <a name="data-endpoints"></a>

| Endpoint | Methods | Description |
| -------- | ------- | ----------- |
| `\licenses` | `GET`, `POST`, `DELETE` | Manage organization (license) data. |
| `\results` | `GET`, `POST`, `DELETE` | Manage result data. |
| `\strains` | `GET`, `POST`, `DELETE` | Manage strain data. |
| `\users` | `GET`, `POST` | Manage your user data. |

## API Functional Endpoints <a name="data-endpoints"></a>

| Endpoint | Methods | Description |
| -------- | ------- | ----------- |
| `\coas` | `GET`, `POST`, `DELETE` | Parse and retrieve COA data. |
| `\labels` | `GET`, `POST`, `DELETE` | Parse and retrieve label data. |
| `\receipts` | `GET`, `POST`, `DELETE` | Parse and retrieve receipt data. |
| `\search` | `GET`, `POST` | Search the API data. |
| `\standardize` | `GET`, `POST` | Standardize data. |

## Examples <a name="examples"></a>

You can make requests through the API passing your API key as a bearer token in the authorization header. Below is an example reading an API key from a local `.env` file.

=== "Python"

    ```py
    from dotenv import load_dotenv
    import os
    import requests

    # Load your API key.
    load_dotenv('.env')
    API_KEY = os.getenv('CANNLYTICS_API_KEY')

    # Pass your API key through the authorization header as a bearer token.
    HEADERS = {
        'Authorization': 'Bearer %s' % API_KEY,
        'Content-type': 'application/json',
    }

    # Parse a COA through the API.
    data = {'urls': ['https://cannlytics.page.link/test-coa']}
    endpoint = 'https://cannlytics.com/api/coas'
    response = requests.post(endpoint, headers=headers, json=data)
    extracted = response.json()
    print(extracted["data"])
    ```


=== "Node.js"

    ```js
    const axios = require('axios');
    require('dotenv').config();

    // Pass API key through the authorization header as a bearer token.
    const apiKey = process.env.CANNLYTICS_API_KEY;
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${apiKey}`
      }
    };

    // Parse a COA through the API.
    const data = { urls: ['https://cannlytics.page.link/test-coa'] };
    const endpoint = 'https://cannlytics.com/api/coas';
    axios.post(endpoint, data, options)
      .then((response) => {
        const extracted = response.data;
        console.log(extracted["data"]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    ```

## API Support

If you have any questions or need help with the Cannlytics API, then please <a href="https://cannlytics.com/support?topic=api">contact us</a>. We are happy to help you get started with the Cannlytics API.
