// с помощью jQuery дождемся окончания загрузки документа
$(document).ready(function () {
    // подхватим конфигурацию Okta из /layouts/partials/script.html
    var config = window.okta.config;
  
    // создаем экземпляр виджета Sign-In Okta
    var signIn = new OktaSignIn({
      clientId: config.clientId,          // обязательно
      baseUrl: config.baseUrl,            // обязательно
      redirectUri: config.redirectUri,    // обязательно
      authParams: {
        display: 'page',
        responseType: 'code',
        grantType: 'authorization_code'
      },
      features: {
        registration: true                // разрешаем регистрацию пользователя
      }
    });
  
    // проверяем не является ли текущий запрос обратным перенаправлением с Okta login
    function isRedirect() {
      return /((code|state)=)/.test(window.location.hash);
    }
  
    // Получаем сессию входа
    function getSession() {
      return signIn.authClient.session.get()
        .then(function (session) {
          if (session.status === "ACTIVE") {
            return session.user().then(function (user) {
              return {
                session,
                user
              }
            });
          }
          return { session, user: {} };
        })
        .catch(function (err) {
          console.error("session error", err);
        });
    }
  
    function showWelcomeMessage(profile) {
      $('#okta-login-firstname').html(profile.firstName)
      $('#okta-login-success').show();
    }
  
    // функция клика для кнопки выхода
    $('#okta-sign-out').click(function() {
      signIn.authClient.session.close().then(function() {
        location.reload();
      });
    });
  
    if (isRedirect()) {
      // Парсим токен полученный от Okta
      signIn.authClient.token.parseFromUrl()
        .then(function (res) {
          var accessToken = res[0];
          var idToken = res[1];
          // set tokens for the active session
          signIn.authClient.tokenManager.add('accessToken', accessToken);
          signIn.authClient.tokenManager.add('idToken', idToken);
  
          // используем Okta API чтобы получить текущего пользователя
          return getSession()
            .then(function(res) {
              // показываем приветственное сообщение
              showWelcomeMessage(res.user.profile);
            })
            .catch(function (err) {
              console.error("getSession error", err);
            });
        })
        .catch(function (err) {
          console.error("parseFromUrl error", err);
        });
    } else {
      // Пробуем получить сессию
      getSession()
        .then(function(res) {
          if (res.session.status === 'ACTIVE') {
            // Показываем приветственное сообщение, если сессия активна
            showWelcomeMessage(res.user.profile);
            return;
          }
          // Показываем форму входа, если сессия не активна
          signIn.renderEl({ el: '#okta-login-container' });
        })
        .catch(function(err){
          console.error(err);
        });
    }
  });