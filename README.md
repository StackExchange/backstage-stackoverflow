# Backstage - Stack Overflow for Teams Plugin

## Overview

The **Stack Overflow for Teams** plugins for **Backstage** integrate your private knowledge solution with your Backstage instance. These plugins provide seamless access to **Stack Overflow Teams'** most relevant data, allowing you to display the top users, top tags, and top questions directly within Backstage. Additionally, it indexes all the questions from a Stack Overflow instance and integrates them into Backstage search, providing enhanced discoverability.

These plugins also allow you to securely create **Stack Overflow for Teams** questions from Backstage itself.

## Key Features

### OAuth Authentication

The plugin uses OAuth authentication to ensure that only authorised users can post questions to your Stack Overflow instance from Backstage. The OAuth process is secure, user-friendly, and integrates seamlessly with Backstage, providing a safe way to verify user identities before allowing access to question creation features.

### Top Users and Tags
Displays the top users and tags from your Stack Overflow instance, giving you insights into the most active contributors and trending topics.

<img width="2260" height="1264" alt="image" src="https://github.com/user-attachments/assets/a28f5380-f9f8-453a-b60e-855c02c45f38" />
<img width="449" height="316" alt="Screenshot 2025-08-05 at 23 14 15" src="https://github.com/user-attachments/assets/64fbb6bf-b1fd-422b-8be6-7b5b1a2d5483" />


### Question Indexing
Retrieves all the questions from your Stack Overflow instance and indexes them into Backstage search. This makes it easier to search and discover questions across your organisation.

![alt text](https://i.imgur.com/HLKNAZb.png)

### Stack Overflow Hub
A centralised hub within Backstage that showcases the top questions. The hub also allows you to filter questions like you would on Stack Overflow.

<img width="2269" height="1260" alt="image" src="https://github.com/user-attachments/assets/da2059ec-3507-4b2c-86c4-ce799d2d4d67" />

### Question Creation Form

Once authenticated, users can create questions using a dedicated form within Backstage. This form features a rich text editor for formatting questions, question tips and tag autocompletion to help users categorise their questions efficiently.

<img width="2553" height="1263" alt="image" src="https://github.com/user-attachments/assets/2e3a89c6-291f-43d2-ba1e-7e284c7775bb" />


## Demo Docker Image

If you’d like to quickly see how this integration works without setting up your own Backstage instance, you can use my Docker image:

**`estoesmoises/stackoverflow-backstage-demo:latest`**

This image runs a Backstage instance pre-configured with the Stack Overflow for Teams plugin. You just need to pass a few environment variables when starting the container to connect it to your Stack Overflow for Teams instance.

---

## 📦 Required Environment Variables

### For **Enterprise** Customers:

| Variable                          | Description                                                                                                                                                                                                                                                                                        |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `STACK_OVERFLOW_INSTANCE_URL`     | The base URL of your Stack Overflow for Teams (Enterprise) instance.                                                                                                                                                                                                                               |
| `STACK_OVERFLOW_API_ACCESS_TOKEN` | A **read-only, no-expiry** API access token generated for your Stack Overflow Enterprise instance. This token is used by the plugin’s search collator to index questions into Backstage search.                                                                                                    |
| `STACK_OVERFLOW_CLIENT_ID`        | The OAuth Client ID from your Stack Overflow application. This is required to enable the secure question creation flow from within Backstage.                                                                                                                                                      |
| `STACK_OVERFLOW_REDIRECT_URI`     | The redirect URI where Stack Overflow should send users after completing the OAuth authentication flow. By default, this is `{app.baseUrl}/stack-overflow-teams`. For local development, you can use a redirect service like `http://redirectmeto.com/http://localhost:7007/stack-overflow-teams`. |

---

### For **Basic** and **Business** Customers:

| Variable                          | Description                                                                                                              |
| :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `STACK_OVERFLOW_TEAM_NAME`        | The **team name** or **team slug** from your Stack Overflow for Teams account.                                           |
| `STACK_OVERFLOW_API_ACCESS_TOKEN` | A **read-only, no-expiry** API access token generated for your Stack Overflow Teams instance. Used for indexing content. |

> **Note:**  
> Question creation is **not supported** on the **Basic** tier.

📖 How to generate your API Access Token

Basic and Business customers can follow the official Stack Overflow for Teams guide to create a Personal Access Token (PAT) for API authentication:

👉 [Personal Access Tokens (PATs) for API Authentication](https://stackoverflowteams.help/en/articles/10908790-personal-access-tokens-pats-for-api-authentication)

This token should have read-only access and no expiration to be used for indexing questions into Backstage search.

---

### Example Docker Command

Once you have those values, run:

```bash
docker run -p 7007:7007 \
  -e STACK_OVERFLOW_INSTANCE_URL=https://support-autotest.stackenterprise.co \
  -e STACK_OVERFLOW_API_ACCESS_TOKEN='CasdasdasdaDQyrqdfQ))' \
  -e STACK_OVERFLOW_CLIENT_ID=19 \
  -e STACK_OVERFLOW_REDIRECT_URI=http://redirectmeto.com/http://localhost:7007/stack-overflow-teams \
  estoesmoises/stackoverflow-backstage-demo:latest
```

## Installation

Follow these steps to install and run the plugin locally:

1. Clone the repository
    
2.  Navigate into the project directory:
    
    ```bash
    cd backstage-stackoverflow
    
    ```
    
3.  Install dependencies:
    
    ```bash
    yarn install
    
    ```
    
4.  The installation will scaffold the Backstage application and include the necessary plugins. 
    
5.  The plugins this project aims to develop are located in the `/plugins` folder. Changes to the code will usually trigger a hot reload. If not, you can restart the Backstage application.
    
6.  To start the Backstage application, run:
    
    ```bash
    yarn dev
    
    ```
    
## Contributing

Feel free to fork this repository and submit pull requests. Contributions, suggestions, and bug reports are welcome!
