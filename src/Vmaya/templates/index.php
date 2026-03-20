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
  <link href="<?=BASEURL?>/styles/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="./styles/bootstrap-icons.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="<?=BASEURL?>/styles/main.css?v=<?=$v?>">
  <link rel="stylesheet" href="<?=BASEURL?>/styles/dialog.css?v=<?=$v?>">
  <script src="<?=SCRIPTURL?>jquery-4.0.0.min.js"></script>
  <script>
    var DEV = <?=DEV ? 'true' : 'false'?>;
  </script>
  <?include('ya-mertika.php');?>
</head>
<body>
    <?=$content?>
</body>
</html>