/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import {deepOrange500} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import Chip from 'material-ui/Chip';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';

const styles = {
  container: {
    textAlign: 'left',
  },
  titleStyle: {
    fontSize: '16px',
  },
  titleWrapStyle: {
    position: 'abusolute',
  },
  controlsStyle: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    left: 0,
    display: 'flex',
  },
  hintStyle: {
    bottom: '9px',
    fontSize: '14px',
  },
  textFieldStyle: {
    flex: 3,
    height: 'auto',
    paddingLeft: '20px',
    lineHeight: 'auto',
    border: '1px solid #eee',
    fontSize: '14px',
  },
  sendBtnStyle: {
    flex: 1,
    boxShadow: 'none',
    fontSize: '14px',
  },
  dialogStyle: {
    position: 'fixed',
    top: '20%',
    width: '100%',
    textAlign: 'center',
    zIndex: 1500,
  },
  contentStyle: {
    width: '70%',
    margin: '150px auto',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  loginStyle: {
    marginTop: '20px'
  },
  statusStyle: {
    marginTop: '10px'
  },
  wrapperStyle: {
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  chipWrapStyle: {
    width: '100%',
    marginTop: '10px',
    overflow: 'hidden'
  }
};

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false, 
      msg: '', // 消息内容
      nickName: '', // 用户昵称
      color: '', // 消息颜色
      historyMsg: [], // 历史消息 
      socket: null, // socket对象
      showTools: false, // 是否展示工具栏
      connect: false, // 是否连接成功
      login: false, // 是否登录，弹窗展示
      status: '', // 当前状态
      tipsOpen: false, // 提示框显示与否
      tips: '', // 提示框内容
    };
  }

  // 颜色值变化
  handleColorChange(event){
    this.setState({
      color: event.target.value
    })
  }

  // 消息输入框变化
  handleMsgChange(event){
    this.setState({
      msg: event.target.value,
      tipsOpen: false
    })
  }

  // 输入昵称
  handleNicknameChange(event){
    this.setState({
      nickName: event.target.value
    })
  }

  // 处理登录
  login = () => {
    let nickName = this.state.nickName;
    if (!nickName) return false;
    this.socket.emit('login', nickName);
    // 关闭登录窗
    this.setState({
      login: true
    })
  }

  // 发送消息
  sendMsg = ()  => {
    if(!this.state.msg) return false;
    this.socket.emit('postMsg', this.state.msg);
    this.pushMsg(this.state.msg, 'right', this.state.nickName, this.state.color);
    this.setState({
      msg: '' // 清空输入框
    });
  }

  // 清除消息记录
  clearMsg = () => {
    this.setState({
      historyMsg: [],
      tipsOpen: false
    })
  }

  logout = () => {
    this.clearMsg();
    this.setState({
      login: false,
      nickName: ''
    })
  }

  // 新增消息记录
  pushMsg(msg, direction, avatar, color){
    let t = this.state.historyMsg;
    t.push({
      direction: direction,
      msg: msg,
      avatar: avatar,
      color: color
    });
    this.setState({
      historyMsg: t
    })
  }

  componentDidMount() {
      let me = this;
      me.socket = io.connect();
      let sk = me.socket;
      console.log(sk);
      sk.on('connect', () => {
        me.setState({
          connect: true
        })
      });
      sk.on('nickExisted', () => {
          me.setState({
            tipsOpen: true,
            tips: '!nickname is taken, choose another pls'
          });
      });
      sk.on('loginSuccess', () => {
          console.log('loginSuccess');
      });
      sk.on('error', (err) => {
          console.log(err);
          me.setState({
            status: '!fail to connect :('
          })
      });
      sk.on('system', (nickName, userCount, type) => {
          me.setState({
            status: `${userCount} ${userCount > 1 ? ' users' : ' user'} online`,
            tipsOpen: me.state.login ? true : false,
            tips: `system: ${nickName} joined`
          });
      });
      sk.on('newMsg', (user, msg, color) => {
          console.log(user, msg, color);
          this.pushMsg(msg, 'left', user, color);
      });
  }

  render() {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleRequestClose}
      />
    );
    let msgList = this.state.historyMsg.map((item,index) =>
      {
        let chipStyle = {
          color: item.color,
          float: item.direction
        }
        return <div key={index} style={styles.chipWrapStyle}><Chip style={chipStyle}><Avatar size={32}>{item.avatar.substring(0,1)}</Avatar>{item.msg}</Chip></div>
      }
    );
    let Tools = (props) => (
      <IconMenu 
        {...props}
        iconButtonElement={
          <IconButton><MoreVertIcon /></IconButton>
        }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
          <MenuItem primaryText="clear" onClick={this.clearMsg}/>
          <MenuItem primaryText="sign out" onClick={this.logout} />
      </IconMenu>
    );
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <AppBar
            title="HiChat"
            style={styles.titleWrapStyle}
            titleStyle={styles.titleStyle}
            iconElementRight={this.state.showTools ? <Tools /> : <Tools />}
          />
          {this.state.login ? 
            <div style={styles.wrapperStyle}>
              <Chip style={styles.statusStyle}>{this.state.status}</Chip>
              <div id="historyMsg">
                {msgList}
              </div>
            </div> : ''
          }
          {this.state.login ? 
            <div style={styles.controlsStyle}>
                <TextField
                  style={styles.textFieldStyle}
                  hintStyle={styles.hintStyle}
                  textareaStyle={styles.textareaStyle}
                  hintText="say something~"
                  value={this.state.msg}
                  underlineShow={false}
                  onChange={this.handleMsgChange.bind(this)}
                /> 
                <RaisedButton label="send" primary={true}
                              buttonStyle={styles.sendBtnStyle} 
                              onClick={this.sendMsg}/>
            </div> : ''
          }
          {!this.state.login ? 
            <div style={styles.contentStyle}>
              <TextField
                hintText="put in your nickname~"
                floatingLabelText="put in your nickname~"
                value={this.state.nickName}
                onChange={this.handleNicknameChange.bind(this)}
              />
              <RaisedButton label="login" primary={true}
                            style={styles.loginStyle}
                            onClick={this.login.bind(this)}/>
            </div> : ''
          }
          <Snackbar
            open={this.state.tipsOpen}
            message={this.state.tips}
            autoHideDuration={2000}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Main;
