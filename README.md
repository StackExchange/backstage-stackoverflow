
# Backstage - Stack Overflow for Teams Plugin

## Overview

The **Stack Overflow for Teams** plugins for **Backstage** integrate your private knowledge solution with your Backstage instance. These plugins provide seamless access to **Stack Overflow Teams'** most relevant data, allowing you to display the top users, top tags, and top questions directly within Backstage. Additionally, it indexes all the questions from a Stack Overflow instance and integrates them into Backstage search, providing enhanced discoverability.

These plugins also allow you to securely create **Stack Overflow for Teams** questions from Backstage itself.

## Key Features

### Top Users and Tags
Displays the top users and tags from your Stack Overflow instance, giving you insights into the most active contributors and trending topics.

![alt text](https://i.imgur.com/vsCQUx2.png)
![alt text](https://i.imgur.com/Wd2mzfa.png)

### Question Indexing
Retrieves all the questions from your Stack Overflow instance and indexes them into Backstage search. This makes it easier to search and discover questions across your organization.

![alt text](https://i.imgur.com/HLKNAZb.png)

### Stack Overflow Hub
A centralized hub within Backstage that showcases the top questions. The hub also allows you to filter questions like you would on Stack Overflow.

![alt text](https://i.imgur.com/WUJMl48.png)

### OAuth Authentication for Secure Question Creation
One of the most exciting features of this plugin is the ability to securely create questions on your Stack Overflow instance directly from Backstage using OAuth. The authentication process is secure, ensuring that only authorized users can post questions, and it is designed to seamlessly integrate with Backstage.

![alt text](https://i.imgur.com/8VxMDys.png)

## Demo Docker Image

If you’d like to quickly see how this integration works without setting up your own Backstage instance, you can use my Docker image:

**`estoesmoises/stackoverflow-backstage-demo:latest`**

This image runs a Backstage instance pre-configured with the Stack Overflow for Teams plugin. You just need to pass a few environment variables when starting the container to connect it to your Stack Overflow for Teams instance.

---

### Required Environment Variables

| Variable                          | Description                                                                                                                                                                                                                     |
|:----------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `STACK_OVERFLOW_INSTANCE_URL`     | The base URL of your Stack Overflow for Teams (Enterprise) instance.                                                                                                                     |
| `STACK_OVERFLOW_API_ACCESS_TOKEN` | A **read-only, no-expiry** API access token generated for your Stack Overflow Enterprise instance. This token is used by the plugin's search collator to index questions into Backstage search. |
| `STACK_OVERFLOW_CLIENT_ID`        | The OAuth Client ID from your Stack Overflow application. This is required to enable the secure question creation flow from within Backstage.                                             |
| `STACK_OVERFLOW_REDIRECT_URI`     | The redirect URI where Stack Overflow should send users after completing the OAuth authentication flow. By default, this is `{app.baseUrl}/stack-overflow-teams`. For local development, you can use a redirect service like `http://redirectmeto.com/http://localhost:7007/stack-overflow-teams`. |


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
