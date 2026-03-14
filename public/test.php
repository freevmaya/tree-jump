<head>
    <title>Test</title>
    <script src="scripts/browser.min.js?v=123122"></script>
</head>
<body>
    <h1 style="color:green">Test Page</h1>
    <script>
        vkBridge.send("VKWebAppInit", {})
            .then((response)=>{
                console.log(response);
            });
    </script>
</body>
</html>