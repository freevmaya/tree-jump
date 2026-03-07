<?
    $page_title = Lang('app_name');
    $v = SCRIPTS_VERSION;
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title><?=$page_title?></title>
  
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="./styles/main.css?v=<?=$v?>">
  <link rel="stylesheet" href="./styles/dialog.css?v=<?=$v?>">
  <script type="text/javascript">
    var DEV = <?=DEV ? 'true' : 'false'?>;
  </script>
</head>
<body>
    <?=$content?>
</body>
</html>