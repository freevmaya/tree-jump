<?
  include("config/config.php");
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Tree Jump — отскоки от дерева</title>
  
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="./styles/main.css?v=9">
  <link rel="stylesheet" href="./styles/dialog.css?v=9">
  <script type="text/javascript">
    var DEV = <?=DEV ? 'true' : 'false'?>;
  </script>
</head>
<body>
  <!-- Основной контейнер игры -->
  <div id="game-container" class="hide">
    <div class="game-top"></div>
    <!-- Верхний блок с игрой (85%) -->
    <div id="game-canvas-container">
      <div id="canvas-container"></div>
    </div>
  </div>
  
  <!-- Подсказка в игре (будет скрыта до старта) -->
  <div class="hint desktop" id="game-hint" style="display: none;">
    <i class="bi bi-mouse"></i> Зажмите левую кнопку и тяните, чтобы вращать дерево
  </div>
  
  <!-- Индикатор очков (только при победе) -->
  <div class="score-indicator" id="score-indicator" style="display: none;">
    <i class="bi bi-trophy-fill"></i> Счет: <span id="current-score">0</span>
  </div>

  <!-- Bootstrap модальное окно для Start Game -->
  <div class="modal fade" id="startModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p>
                <i class="bi bi-info-circle"></i> Управляйте вращением дерева, чтобы шарик отскакивал от платформ
              </p>
              <p>
                <i class="bi bi-exclamation-triangle-fill"></i> Красные платформы смертельны при ударе сверху!
              </p>
              <p <?=DEV ? '' : 'style="display:none"'?>GPU speed: <span id="testResult"></span></p>
              <div class="text-center">
                <button type="button" class="btn" id="startGameButton">Начать</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Game Over -->
  <div class="modal fade" id="gameOverModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="status">Неудача!</p>
              <div class="stats-container">
                <div class="row">
                  <div class="col-12">
                    <div class="stat-value" id="finalBounceCount">0</div>
                    <div class="stat-label">Отскоков</div>
                  </div>
                </div>
              </div>
              <div class="text-center">
                <button type="button" class="btn" id="restartButton">Новая игра</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Victory (Победа) -->
  <div class="modal fade" id="victoryModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="modal-subtitle status">
                Вы достигли вершины дерева!
              </p>
              <!-- Статистика игры -->
              <div class="stats-container victory-stats">
                <div class="row">
                  <div class="col-6">
                    <div class="stat-value" id="victoryBounceCount">0</div>
                    <div class="stat-label">Отскоков</div>
                  </div>
                  <div class="col-6">
                    <div class="stat-value" id="victoryScore">0</div>
                    <div class="stat-label">Очки</div>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <button type="button" class="btn" id="victoryRestartButton">Продолжить</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Pause (Пауза) -->
  <div class="modal fade" id="pauseModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="status">Игра приостановлена</p>
              <div class="text-center">
                <button type="button" class="btn" id="resumeButton">Продолжить</button>
                <button type="button" class="btn" id="pauseRestartButton">Новая игра</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Подключаем Bootstrap JS глобально -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  
  <!-- Import maps для Three.js -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
      "@scripts/": "./scripts/"
    }
  }
  </script>
  
  <!-- Main script -->
  <script type="module" src="./scripts/main.js?v=9"></script>
</body>
</html>