# Server Manager

A simple desktop application built with Electron to help you manage and monitor your Node.js servers. Easily add, start, stop, and remove your server processes, and view their console output in a clean and organized interface.

![Screenshot of the application](https://cdn.nest.rip/uploads/d0769292-4bf9-4083-ae81-1ae10a06ce2d.png)

## Features

* **Add Server:** Easily add new Node.js server configurations by selecting their entry point file.
* **Start/Stop/Restart:** Control the lifecycle of your Node.js servers with simple start and stop actions.
* **Console Output:** View the real-time console output of each server in a dedicated tab.
* **Server Management:** Keep track of all your added servers in a clear list.
* **Persistent Storage:** Server configurations are saved and loaded automatically.
* **Modern UI:** A clean and intuitive dark-themed user interface.
* **Welcome Tab:** A helpful "Welcome" tab appears when no servers are added.

## Getting Started

### Prerequisites

* **Node.js and npm:** Ensure you have Node.js and npm (Node Package Manager) installed on your system. You can download them from [https://nodejs.org/](https://nodejs.org/).
* **Git (Optional):** If you want to clone the repository.

### Installation

1.  **Clone the repository (if you have it on a Git platform):**

    ```bash
    git clone https://github.com/The-JB-Association/Server-Manager.git
    cd server-manager
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

## Building the Application Yourself

This guide will walk you through the steps to build the Server Manager application from the source code for your specific operating system.

### Prerequisites for Building

* **Node.js and npm:** Required for running build scripts.
* **Git:** Recommended for cloning the repository and managing versions.

### Build Instructions

1.  **Clone the repository (if you haven't already):**

    ```bash
    git clone https://github.com/The-JB-Association/Server-Manager.git
    cd node-server-manager
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Build for your target platform:**

    Run the appropriate command based on the operating system you want to build for:

    * **Windows (`.exe` installer - recommended):**

        ```bash
        npm run build --win --ia32 --x64
        ```

        This command will build a Windows installer (`.exe`) for both 32-bit and 64-bit systems. The output will typically be in a `dist` folder.

    * **Windows (`.exe` portable - standalone executable):**

        ```bash
        npm run build --win portable --ia32 --x64
        ```

    * **macOS (`.dmg` package):**

        ```bash
        npm run build --mac
        ```

        This will create a `.dmg` file in the `dist` folder.

    * **Linux (`.deb` and `.rpm` packages):**

        ```bash
        npm run build --linux
        ```

        This will generate `.deb` (for Debian/Ubuntu-based systems) and `.rpm` (for Fedora/CentOS/Red Hat-based systems) packages in the `dist` folder.

    * **Build for all major platforms:**

        ```bash
        npm run build --win --mac --linux
        ```

    The build process might take some time as it downloads Electron binaries and packages your application.

4.  **Locate the built application:**

    After the build process is complete, the packaged application files will be located in the `dist` folder in your project directory.

## Contributing

If you'd like to contribute to the development of Node Server Manager, feel free to fork the repository and submit pull requests. Please follow standard coding conventions and provide clear descriptions of your changes.

## License

This software is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. See the [LICENSE](LICENSE) file for more information.

[![CC BY-NC 4.0](https://licensebuttons.net/l/by-nc/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc/4.0/)
