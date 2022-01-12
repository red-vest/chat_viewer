import React from 'react'
import './chatViewer.scss'
import io from 'socket.io-client'
import config from '../../config'
import SingleMsg from './singleMsg/singleMsg'
import LivePlay from './livePlay/livePlay'
import PlayControl from './playControl/playControl'
import Axios from 'axios'
import { Row, Col, message, Modal, Button, Input,Radio } from 'antd'
import axios from 'axios'
const {TextArea} = Input;
let num = 0;
let maxChat = 100;


let socket = null, socketTwo = null, move = false,offSetX = 0;

function gql (query) {
  return query[0]
}

class ChatViewer extends React.PureComponent {
  constructor () {
    super()
    this.state = {
      chatList: [],
      inputMsg:'',
      count: 0,
      hot: 0,
      lessonId:'',
      uid: '',
      oldCount: 0,
      oldHot: 0,
      socket:undefined,
      mobile: '',
      pwd: '',
      courseList: [],
      showStop:false,
      username: '',
      loginVisible: false,
      avatar: '',
      width: '',
      playWidth: 550,
      add: false,
      notice:'',
      oldNotice:'',
      selectNotice:'1'
    }
    this.changeCourse = this.changeCourse.bind(this)
    this.init = this.init.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.drag = this.drag.bind(this)
    this.getNotice = this.getNotice.bind(this)
    this.msgRef = this.msgRef.bind(this)
    this.scrollStop = this.scrollStop.bind(this)
    this.resScroll = this.resScroll.bind(this)
  }

  componentDidMount () {
    this.setState({
      width: document.body.offsetWidth,
      avatar: window.sessionStorage.getItem('avatar'),
      username: window.sessionStorage.getItem('nickName'),
      uid: window.sessionStorage.getItem('token') || ''
    })
    window.addEventListener('resize', _ => {
      this.setState({ width: document.body.offsetWidth })
    })
    document.addEventListener('mouseup',_=>{
      this.endDrag(_)
    })
    document.addEventListener('mousemove',_=>{
      this.drag(_)
    })
    this.getCourseList()
  }
  msgRef(ref){
    this.singleMsg = ref
  }
  init (courseId, lessonId, channel, uid, username, channelId) {
    const data = {
      forceNew: true,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoconnect: true,
      transports: ['websocket'],
      query: {
        courseId,
        lessonId,
        uid,
        channel,
        username,
      }
    }
    if (socket !== null) {socket.close()}
    if (socketTwo !== null) {socketTwo.close()}
    socket = io(config.ioUrl, data)
    this.setState({socket})
    socketTwo = io('https://wss.xintujing.cn/chat', {
      transports: ['websocket']
    })
    socketTwo.on('connect', _ => {
      let charRoomLoginInfo = {
        userId: ``,
        room: channelId,
        username: ``,
        level: '4'
      }
      socketTwo.emit('login', charRoomLoginInfo)
      socketTwo.on('login',_=>{
        if(num<=0){
          socketTwo.emit('heat')
          socketTwo.emit('received message')
          socketTwo.emit('receive flower')
          socketTwo.emit('get all main point')
          socketTwo.emit('get announcement')
          socketTwo.emit('get banned time')
          socketTwo.emit('get question')
          num+=1
        }
      })
    })
    socket.on('connect', _ => {
      message.success('连接成功')
    })
    socket.on('disconnect', _ => {
      console.log(_)
    })
    socket.on('notify', _ => {
      this.setState({notice:_})
    })
    socket.on('connect_error', _ => {
      console.log(_)
    })
    socket.on('error', _ => {
      console.log(_)
    })
    socket.on('connect_timeout', _ => {
      console.log(_)
    })
    socket.on('con_error', _ => {
      message.error(_ + '请退出重新登录！')
    })
    socket.on('user join', _ => {
      console.log(_)
    })
    socket.on('user leave', _ => {
      console.log(_)
    })
    socket.on('heat', _ => {
      this.setState({ hot: _ })
    })
    socketTwo.on('heat', _ => {
      this.setState({ oldHot: _ })
    })
    socket.on('msg', e => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = e.m.g
      obj.p = e.m.p
      obj.f = e.m.f || ''
      obj.u = e.i+'-'+e.u
      obj.giftMsg = '赠送了'
      obj.c = e.c
      obj.i = e.i
      obj.s = '0'
      let tempList = [...this.state.chatList, obj];
      if(tempList.length>maxChat){
        tempList.splice(0,tempList.length-maxChat)
      }
      this.setState({ chatList: tempList },_=>{
        this.singleMsg.scroll()
      })
    })
    socketTwo.on('received message', _ => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = _.msg
      obj.p = '0'
      obj.u = _.user.userId+'-'+_.user.username
      obj.c = _.user.level === '2' ? 2 : _.user.level === '3' ? 3 : 0
      obj.s = '1'
      let tempList = [...this.state.chatList, obj];
      if(tempList.length>maxChat){
        tempList.splice(0,tempList.length-maxChat)
      }
      this.setState({ chatList: tempList },_=>{
        this.singleMsg.scroll()
      })
    })
    socketTwo.on('get announcement',_=>{
      this.setState({oldNotice:_.msg})
    })
    socketTwo.on('receive announcement',_=>{
      this.setState({oldNotice:_.msg})
    })

    socketTwo.on('receive flower', _ => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = '一朵'
      obj.p = '1'
      obj.giftMsg = '送给老师'
      obj.u = _.user.userId+'-'+_.user.username
      obj.c = 0
      obj.s = '1'
      obj.f = '5'
      let tempList = [...this.state.chatList, obj];
      if(tempList.length>maxChat){
        tempList.splice(0,tempList.length-maxChat)
      }
      this.setState({ chatList: tempList },_=>{
        this.singleMsg.scroll()
      })
    })
    socketTwo.on('interaction number', _ => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = _.type === 0 ? '老师好' : _.type === 1 ? '明白了' : '还不懂'
      obj.p = '1'
      obj.giftMsg = ''
      obj.u = _.user.userId+'-'+_.user.username
      obj.f = _.type === 0 ? 'lsh' : _.type === 1 ? 'mbl' : 'hbd'
      obj.c = 0
      obj.s = '1'
      let tempList = [...this.state.chatList, obj];
      if(tempList.length>maxChat){
        tempList.splice(0,tempList.length-maxChat)
      }
      this.setState({ chatList: tempList },_=>{
        this.singleMsg.scroll()
      })
    })
    socket.on('count', _ => {
      this.setState({ count: _ })
    })
    socketTwo.on('online count', _ => {
      this.setState({ oldCount: _ })
    })
  }
  scrollStop(bool){
    this.setState({showStop:bool})
  }
  async getCourseList () {
    let result = await Axios.get('https://api.xtjzx.cn/course_manager/api/course/list')
    // let resultT = []
    let list = [...result.data.data]
    list.forEach(item => {
      item.name = item.Id + '-' + item.CourseName
    })
    this.setState({ courseList: list })
    return ''
  }

  async getNotice(id=''){
    let result = await axios.post('https://api.xtjzx.cn/index',{
      operationName:'CourseNoticeInfo',
      query: gql`
        query CourseNoticeInfo($id:Long){
            CourseNoticeInfo(input: {id: $id}){
                noticeInfo{
                    content
                }
            }
        }
      `,
      variables: { id }
    })
    this.setState({notice:result.data.data.data.CourseNoticeInfo.noticeInfo.content})
  }

  async login (mobile = this.state.mobile, pwd = this.state.pwd) {
    let result = await Axios.post('https://api.xtjzx.cn/user/login/', {
      operationName: 'LoginByAccount',
      query: gql`
          query LoginByAccount($appCode:Int,$mobile:String,$pwd:String){
              LoginByAccount(input:{appCode:$appCode,mobile:$mobile,pwd:$pwd}){
                  nickName
                  avatar
                  token
                  userType
              }
          }
      `,
      variables: { appCode: 104, mobile, pwd }
    }).catch((err) => {return Promise.reject(err)})
    if (result.data.code === '400') {
      message.error(result.data.msg)
      return
    }
    message.success('登录成功')

    const { nickName, token, avatar, userType } = result.data.data.data.LoginByAccount
    window.sessionStorage.setItem('token', token)
    window.sessionStorage.setItem('avatar', avatar)
    window.sessionStorage.setItem('nickName', nickName)
    this.setState({
      uid: token,
      username: nickName,
      loginVisible: false,
      avatar: avatar,
      mobile: '',
      pwd: ''
    })
  }

  async logout () {
    this.setState({ uid: '', mobile: '', pwd: '', liveUrl: '', chatList: [], hot: 0, count: 0 })
    try {
      socket.close()
    } catch (e) {}
    sessionStorage.clear()
    message.success('登出成功')
  }

  showLogin () {
    this.setState({ loginVisible: true })
  }
  sendMsg(){
    if(this.state.inputMsg==='') return;
    socket.emit('msg', { g: this.state.inputMsg, p: '0' })
    this.setState({inputMsg:''})
  }

  async changeCourse (e) {
    let result = await Axios.post('https://api.xtjzx.cn/index', {
      operationName: 'chapterListCached',
      query: '↵    query chapterListCached($courseId:Long){↵        chapterListCached(input:{courseId: $courseId}){↵' +
              '            chapter{↵                chapterName↵                courseId↵                id↵                chapterLesson{↵                    chapterId↵                    id↵                    liveStatus↵                    name↵                    openTime↵                    lowQualityUrl↵                    normalQualityUrl↵                    highQualityUrl↵                    chatHistory↵                }↵            }↵        }↵    }↵    ',
      variables: {
        courseId: e.toString()
      }
    })
    let list = result.data.data.data.chapterListCached.chapter
    let lessonId = 0
    list.forEach(item => {
      if (item.chapterLesson !== undefined && item.chapterLesson.length > 0) {
        item.chapterLesson.forEach(i => {
          if (i.liveStatus === 1) {
            lessonId = i.id
          }
        })
      }
    })
    if (lessonId === 0) {
      message.info('该课程当前没有直播')
      return
    }
    let url = await Axios.post('https://api.xtjzx.cn/index', {
      operationName: 'GetCourseVideo',
      query: '↵    query GetCourseVideo($courseId:Long,$lessonId:Long){↵        getCourseVideo(input:' +
              ' {courseId:$courseId,lessonId: $lessonId}){↵            courseLive{↵                avChatRoomId↵                channelId↵                name↵                playUrl↵            }↵            courseVideo{↵                chatHistory↵                lowQualityUrl↵                normalQualityUrl↵                highQualityUrl↵            }↵        }↵    }',
      variables: { lessonId, courseId: e.toString() },
    })
    await this.getNotice(e.toString())
    this.setState({lessonId, liveUrl: url.data.data.data.getCourseVideo.courseLive.playUrl,courseId:e.toString() })
    let data = url.data.data.data.getCourseVideo.courseLive
    this.init(e, lessonId, data.avChatRoomId, this.state.uid, this.state.username, data.channelId)
  }

  startDrag (e) {
    move = true
    offSetX = e.nativeEvent.offsetX
  }
  resScroll(){
    this.singleMsg.resScroll()
  }
  endDrag () {
    move = false
  }

  drag (e) {
    if (move) {
      let pageX = e.pageX;
      this.setState({playWidth:pageX - offSetX})
    }
  }

  render () {
    return (
            <div className={'all'}>
              {/*<div className={'drag'} onMouseDown={this.startDrag.bind(this)}  style={{ left: this.state.playWidth + 'px' }}/>*/}
              <div className={'chatBox'}>
                <div className={'livePlay'} style={{ width: this.state.playWidth + 'px' }}>
                  <div className={'live'}>
                    <LivePlay id={'courseOne'} liveUrl={this.state.liveUrl}/>
                  </div>
                  <PlayControl id={this.state.courseId} oldHot={this.state.oldHot} oldCount={this.state.oldCount} showLogin={this.showLogin}
                               uid={this.state.uid} selectLive={this.changeCourse}
                               hot={this.state.hot} num={this.state.count} courseList={this.state.courseList}/>
                </div>
                <div className={'chat'} style={{width:`650px`}}>
                  {
                    this.state.showStop?<div onClick={this.resScroll} className={'stopScroll'}>滚动界面，聊天已暂停</div>:''
                  }
                  <div className={'gg'}>
                    <Radio.Group  defaultValue='1' size={'small'} onChange={_=>this.setState({selectNotice:_.target.value})}>
                      <Radio.Button value='1'>新途径在线</Radio.Button>
                      <Radio.Button value='2'>新途径教育</Radio.Button>
                    </Radio.Group>
                    <div className={'notice'}>
                      {this.state.selectNotice==='1'?this.state.notice:this.state.oldNotice}
                    </div>
                  </div>
                  <div onClick={() => this.setState({ loginVisible: !this.state.loginVisible })} className={'other'}/>
                  <SingleMsg lessonId={this.state.lessonId} scrollStop={this.scrollStop} onRef={this.msgRef} chatList={this.state.chatList}/>
                  <div className={'msgSet'}>
                    <TextArea placeholder={'输入内容'} style={{width:'550px'}} showCount onChange={_=>this.setState({inputMsg:_.target.value})} value={this.state.inputMsg} />
                    <Button onClick={this.sendMsg.bind(this)} style={{marginTop:'5px'}} type="primary">发送</Button>
                  </div>
                </div>
              </div>
              <Modal
                      title={'登录'}
                      onCancel={() => this.setState({ loginVisible: false })}
                      visible={this.state.loginVisible}
                      footer={
                        this.state.uid === '' ?
                                [
                                  <Button onClick={() => this.setState({ loginVisible: false })} key="back">取消</Button>,
                                  <Button onClick={_ => this.login()} type="primary" key="login">登录</Button>
                                ] : [
                                  <Button onClick={() => this.setState({ loginVisible: false })} key="back">取消</Button>,
                                  <Button onClick={_ => this.logout()} type="danger" key="exit">登出</Button>,
                                ]}
              >{
                this.state.uid === '' ? <Row align={'middle'}>
                  <Col style={{ textAlign: 'right' }} span={3}>手机号：</Col><Col span={20}><Input
                        onChange={e => this.setState({ mobile: e.target.value })} value={this.state.mobile} allowClear/></Col>
                  <div style={{ height: '5px', width: '100%' }}/>
                  <Col style={{ textAlign: 'right' }} span={3}>密码：</Col><Col span={20}><Input
                        onChange={e => this.setState({ pwd: e.target.value })} value={this.state.pwd}
                        allowClear
                        type={'password'}/></Col>
                </Row> : <div className={'userInfo'}>
                  <Row align={'middle'}>
                    <Col><img className={'avatar'} src={this.state.avatar}
                              alt={'用户头像'}/></Col><Col>{this.state.username}</Col>
                  </Row>
                </div>
              }
              </Modal>
            </div>
    )
  }
}

export default ChatViewer
