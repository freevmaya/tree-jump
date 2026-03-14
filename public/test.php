<head>
    <title>Test</title>
    <script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>

    <script>
      // Sends event to client
      vkBridge.send('VKWebAppInit')
            .then((response)=>{
                console.log(response);
            });
    </script>
</head>
<body>
    <h1 style="color:green">Test Page</h1>
</body>
</html>