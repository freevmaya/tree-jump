<head>
    <title>Test</title>
    <script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>
</head>
<body>
    <h1>Test Page</h1>
    <script>
        vkBridge.send("VKWebAppInit", {})
            .then((response)=>{
                console.log(response);
            });

        console.log("Test page loaded");
    </script>
</body>
</html>