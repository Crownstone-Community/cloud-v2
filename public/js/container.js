'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
  input: {
    width: 'min(85vw, 450px)',
    height: 35,
    padding: 5,
    borderRadius: 5,
    borderColor: '#eee',
    borderWidth: 1
  },
  warningButton: {
    width: 'min(85vw, 450px)',
    height: 35,
    padding: 5,
    borderRadius: 5,
    borderColor: '#9b601d',
    borderWidth: 2,
    backgroundColor: "#ff9c2c"
  }
};

var pathPrefix = "";

var UserDataContainer = function (_React$Component) {
  _inherits(UserDataContainer, _React$Component);

  function UserDataContainer(props) {
    _classCallCheck(this, UserDataContainer);

    var _this = _possibleConstructorReturn(this, (UserDataContainer.__proto__ || Object.getPrototypeOf(UserDataContainer)).call(this, props));

    _this.state = {
      accessToken: null,
      userId: null
    };
    return _this;
  }

  _createClass(UserDataContainer, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
        React.createElement(
          'h1',
          null,
          'Data management'
        ),
        React.createElement('br', null),
        this.state.accessToken === null ? React.createElement(LoginForm, { callback: function callback(tokenData) {
            _this2.setState({ accessToken: tokenData.id, userId: tokenData.userId });
          } }) : React.createElement(UserData, { accessToken: this.state.accessToken, clearCallback: function clearCallback() {
            _this2.setState({ accessToken: null, userId: null });
          } })
      );
    }
  }]);

  return UserDataContainer;
}(React.Component);

var UserData = function (_React$Component2) {
  _inherits(UserData, _React$Component2);

  function UserData(props) {
    _classCallCheck(this, UserData);

    var _this3 = _possibleConstructorReturn(this, (UserData.__proto__ || Object.getPrototypeOf(UserData)).call(this, props));

    _this3.state = {
      downloading: false,
      deleteCheck: false
    };
    return _this3;
  }

  _createClass(UserData, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      if (this.state.deleteCheck) {
        return React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
          React.createElement(
            'h3',
            null,
            'Deleting your data'
          ),
          React.createElement(
            'h4',
            null,
            'IMPORTANT! This can have severe consequences:'
          ),
          React.createElement(
            'ul',
            null,
            React.createElement(
              'li',
              null,
              'If you delete your data, you will no longer be able to log into your Crownstone app.'
            ),
            React.createElement(
              'li',
              null,
              'If you delete your data, this cannot be undone.'
            ),
            React.createElement(
              'li',
              null,
              'If you delete your data and there are no more people in your sphere, your sphere and Crownstones will also be removed.'
            ),
            React.createElement(
              'li',
              null,
              'If your Crownstones are removed, you cannot use them without recovering them.'
            )
          ),
          React.createElement(
            'h4',
            null,
            'Are you sure you want to do this?'
          ),
          React.createElement(
            'button',
            { style: styles.input, onClick: function onClick() {
                _this4.setState({ deleteCheck: false });
              } },
            'No, nevermind.'
          ),
          React.createElement('br', null),
          React.createElement(
            'button',
            { style: styles.warningButton, onClick: function onClick() {
                _this4.deleteAllData();
              } },
            'Delete all my data'
          )
        );
      }

      if (this.state.downloading) {
        return React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
          React.createElement(
            'h3',
            null,
            'Downloading all your data....'
          ),
          React.createElement('img', { src: '../img/slow_spinner.gif' }),
          React.createElement(
            'h4',
            null,
            'This can take up to 5 minutes...'
          )
        );
      }

      return React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
        React.createElement(
          'h2',
          null,
          'What would you like to do?'
        ),
        React.createElement('br', null),
        React.createElement(
          'button',
          { style: styles.input, onClick: function onClick() {
              _this4.downloadAllData().then(function () {
                alert('Your data has been downloaded!');
              });
            } },
          'Download all my data'
        ),
        React.createElement('br', null),
        React.createElement('br', null),
        React.createElement(
          'h4',
          null,
          'DANGER:'
        ),
        React.createElement(
          'button',
          { style: styles.warningButton, onClick: function onClick() {
              _this4.setState({ deleteCheck: true });
            } },
          'Delete all my data'
        )
      );
    }
  }, {
    key: 'downloadAllData',
    value: function downloadAllData() {
      var _this5 = this;

      this.setState({ downloading: true });
      fetch(pathPrefix + '/api/user/allUserData', { method: 'GET', headers: { 'Authorization': this.props.accessToken } }).then(function (response) {
        if (response.status !== 200) {
          alert('Something went wrong (' + response.status + ')');
          _this5.setState({ downloading: false });
        } else if (response.status === 429) {
          alert('You can only do this once every 5 minutes... Try again later.');
          _this5.setState({ downloading: false });
        } else {
          return response.blob().then(function (blob) {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = 'userData.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            _this5.setState({ downloading: false });
          });
        }
      }).catch(function (err) {
        alert('Something went wrong...');
        _this5.setState({ downloading: false });
      });
    }
  }, {
    key: 'deleteAllData',
    value: function deleteAllData() {
      var _this6 = this;

      if (confirm("WARNING: Are you sure you want to delete all your user data?")) {
        fetch(pathPrefix + '/api/user?AreYouSure=I_AM_SURE', { method: 'DELETE', headers: { 'Authorization': this.props.accessToken } }).then(function (response) {
          if (response.status !== 204) {
            alert('Something went wrong (' + response.status + ')');
          } else {
            alert('Delete successful.');
            _this6.props.clearCallback();
          }
        }).catch(function (err) {
          alert('Something went wrong...');
          console.log("Error deleteAllData", err);
        });
      }
    }
  }]);

  return UserData;
}(React.Component);

var LoginForm = function (_React$Component3) {
  _inherits(LoginForm, _React$Component3);

  function LoginForm(props) {
    _classCallCheck(this, LoginForm);

    var _this7 = _possibleConstructorReturn(this, (LoginForm.__proto__ || Object.getPrototypeOf(LoginForm)).call(this, props));

    _this7.state = {
      email: '',
      password: ''
    };
    return _this7;
  }

  _createClass(LoginForm, [{
    key: 'render',
    value: function render() {
      var _this8 = this;

      return React.createElement(
        'form',
        {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
          onSubmit: function onSubmit(event) {
            event.preventDefault();
          }
        },
        React.createElement(
          'h4',
          null,
          'Log in here to manage your data'
        ),
        React.createElement('input', {
          style: styles.input,
          placeholder: "email",
          value: this.state.email,
          onChange: function onChange(e) {
            _this8.setState({ email: e.target.value });
          }
        }),
        React.createElement('br', null),
        React.createElement('input', {
          style: styles.input,
          placeholder: "password",
          type: 'password',
          value: this.state.password,
          onChange: function onChange(e) {
            _this8.setState({ password: e.target.value });
          }
        }),
        React.createElement('br', null),
        React.createElement(
          'button',
          { style: styles.input, onClick: function onClick() {
              _this8.login();
            } },
          'Log in'
        )
      );
    }
  }, {
    key: 'login',
    value: function login() {
      var _this9 = this;

      digestMessage(this.state.password).then(function (hashedPassword) {
        var data = { email: _this9.state.email, password: hashedPassword };
        return fetch(pathPrefix + '/api/user/login', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
      }).then(function (result) {
        if (result.status !== 200) {
          alert("Could not log in, please check your credentials and try again.");
        } else {
          result.json().then(function (tokenData) {
            _this9.props.callback(tokenData);
          });
        }
      });
    }
  }]);

  return LoginForm;
}(React.Component);

function digestMessage(message) {
  var msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  return crypto.subtle.digest('SHA-1', msgUint8).then(function (hashBuffer) {
    // hash the message
    var hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    var hashHex = hashArray.map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join(''); // convert bytes to hex string
    return hashHex;
  });
}

var domContainer = document.querySelector('#management_container');
ReactDOM.render(React.createElement(UserDataContainer, null), domContainer);