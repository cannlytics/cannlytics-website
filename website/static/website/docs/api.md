# The Cannlytics API

The Cannlytics API allows users to seamlessly integrate with all of the functionality that Cannlytics has to offer. The Cannlytics API endpoints are simply an interface to the logic implemented in the `cannlytics` module. The API endpoints handle authentication, error handling, and identifying the precise logic to perform.

## Get Started with the Cannlytics API

Start making requests to the Cannlytics API by following these 3 quick steps.

1. First, [create a Cannlytics account](https://cannlytics.com/account/sign-up).
2. Second, [create an API key](https://cannlytics.com/account/api-keys) in the Cannlytics Console.
3. Finally, you can begin making requests to the Cannlytics API by sending your API Key in an `Authorization: Bearer <token>` header in your requests.

<!-- TODO: Examples! -->

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

## API Support

If you have any questions or need help with the Cannlytics API, then please <a href="https://cannlytics.com/contact?topic=api">contact us</a>. We are happy to help you get started with the Cannlytics API.
