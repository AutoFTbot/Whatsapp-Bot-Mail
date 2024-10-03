# WhatsApp Bot with Temporary Email and Gmail Integration

This project is a WhatsApp bot that allows users to generate temporary email addresses and check their inboxes using the Gmail API. It's designed to help users manage temporary communications efficiently.

## Features

- **Generate Temporary Email**: Instantly create a temporary email address for short-term use.
- **Check Email Inbox**: Retrieve and display emails from the spam folder for a specified temporary email.

## Commands

- `.create`: Generate a new temporary email.
- `.inbox <email>`: Check the inbox for the specified email.

## Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/AutoFTbot/Whatsapp-Bot-Mail
   cd Whatsapp-Bot-Mail
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Google API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project.
   - Enable Gmail API for the project.
   - Navigate to **APIs & Services > Credentials**.
   - Click **Create Credentials** and select **OAuth client ID**.
   - Configure the consent screen if prompted.
   - Choose **Desktop app** as the application type.
   - Add `http://localhost` to **Authorized redirect URIs**.
   - Download the `credentials.json` file and place it in the project directory.

4. **Run the Bot**

   ```bash
   node app.js
   ```

5. **Authorize the Application**

   - Follow the instructions in the terminal to authorize the application with your Google account.

## Requirements

- Node.js
- npm
- Google Cloud account with Gmail API enabled

## Notes

- Ensure `credentials.json` is not included in version control for security reasons.
- Customize the bot further as needed.

## License

This project is licensed under the MIT License.
