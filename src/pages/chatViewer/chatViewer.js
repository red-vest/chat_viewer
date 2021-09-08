import React, { useEffect, useState } from 'react'
import './chatViewer.scss'
import io from 'socket.io-client'
import config from '../../config'
import SingleMsg from './singleMsg/singleMsg'
import LivePlay from './livePlay/livePlay';
import PlayControl from './playControl/playControl'
import Axios from 'axios'
import { Row, Col, Select, message, Modal, Button, Input } from 'antd'
let socket = null,socketTwo = null;


function gql (query) {
  return query[0]
}

class ChatViewer extends React.Component {
  constructor () {
    super()
    this.state = {
      chatList: [],
      count: 0,
      hot: 0,
      uid:'',
      oldCount:0,
      oldHot:0,
      mobile: '',
      pwd: '',
      courseList: [],
      username: '',
      loginVisible: false,
      avatar: '',
      width:'',
      add:false,
    }
    this.changeCourse = this.changeCourse.bind(this)
    this.init = this.init.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.showLogin = this.showLogin.bind(this)
  }

  componentDidMount () {
    this.setState({width:document.body.offsetWidth})
    window.addEventListener('resize',_=>{
      this.setState({width:document.body.offsetWidth})
    })
    this.getCourseList()
  }


  init (courseId, lessonId, channel, uid, username,channelId) {
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
        username:''
      }
    }
    if (socket !== null) {socket.close()}
    if (socketTwo !== null) {socketTwo.close()}
    socket = io(config.ioUrl, data)
    socketTwo = io('https://wss.xintujing.cn/chat',{
      transports: ['websocket']
    })
    socketTwo.on('connect',_=>{
      let charRoomLoginInfo = {
        userId: ``,
        room: channelId,
        username: ``,
        level: '4'
      };
      socketTwo.emit('login', charRoomLoginInfo)
    })
    socket.on('connect', _ => {
      message.success('连接成功')
    })
    socket.on('disconnect', _ => {
      console.log(_)
    })
    socket.on('notify', _ => {
      console.log(_)
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
      console.log(_)
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
    socketTwo.on('heat',_=>{
      this.setState({oldHot:_})
    })
    socket.on('msg', e => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = e.m.g
      obj.p = e.m.p
      obj.f = e.m.f || ''
      obj.u = e.u
      obj.giftMsg = '赠送了'
      obj.c = e.c
      obj.i = e.i
      obj.s = '0'
      this.setState({ chatList: [...this.state.chatList, obj] })
      setTimeout(() => {
        let ele = document.getElementById('msgList')
        ele.scrollTop = ele.scrollHeight
      }, 0)
    })
    socketTwo.on('received message',_=>{
      let obj = {};
      obj.id=Math.random().toString().substr(2) + new Date().getTime();
      obj.g = _.msg
      obj.p = '0'
      obj.u = _.user.username
      obj.c = _.user.level==='2'?2:_.user.level==='3'?3:0
      obj.s = '1'
      this.setState({ chatList: [...this.state.chatList, obj] })
      setTimeout(() => {
        let ele = document.getElementById('msgList')
        ele.scrollTop = ele.scrollHeight
      }, 0)
    })
    socketTwo.on('receive flower',_=>{
      let obj = {};
      obj.id = Math.random().toString().substr(2) + new Date().getTime();
      obj.g='一朵'
      obj.p='1'
      obj.giftMsg = '送给老师'
      obj.u = _.user.username
      obj.c = 0
      obj.s = '1'
      obj.f = '5'
      this.setState({ chatList: [...this.state.chatList, obj] })
      setTimeout(() => {
        let ele = document.getElementById('msgList')
        ele.scrollTop = ele.scrollHeight
      }, 0)
    })
    socketTwo.on('interaction number',_=>{
      let obj = {};
      obj.id=Math.random().toString().substr(2) + new Date().getTime();
      obj.g = _.type===0?'老师好':_.type===1?'明白了':'还不懂'
      obj.p = '1'
      obj.giftMsg = ''
      obj.u = _.user.username
      obj.f = _.type===0?'lsh':_.type===1?'mbl':'hbd'
      obj.c = 0
      obj.s = '1'
      this.setState({ chatList: [...this.state.chatList, obj] })
      setTimeout(() => {
        let ele = document.getElementById('msgList')
        ele.scrollTop = ele.scrollHeight
      }, 0)
    })
    socket.on('count', _ => {
      this.setState({ count: _ })
    })
    socketTwo.on('online count',_=>{
      this.setState({oldCount:_})
    })
  }

  async getCourseList () {
    let result = await Axios.get('https://api.xtjzx.cn/course_manager/api/course/list?course_status=1&is_close=1')
    let resultT = await Axios.get('https://api.xtjzx.cn/course_manager/api/course/list?course_status=1&is_close=2')
    let list = [...result.data.data, ...resultT.data.data]
    list.forEach(item => {
      item.name = item.Id + '-' + item.CourseName
    })
    this.setState({ courseList: list })
    return ''
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
    if(result.data.code==='400'){
      message.error(result.data.msg)
      return
    }
    message.success('登录成功')

    const { nickName, token, avatar, userType } = result.data.data.data.LoginByAccount

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
    try{
      socket.close()
    }catch (e) {}
    message.success('登出成功')
  }
  showLogin(){
    this.setState({loginVisible:true})
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
    this.setState({ liveUrl: url.data.data.data.getCourseVideo.courseLive.playUrl })
    let data =  url.data.data.data.getCourseVideo.courseLive
    this.init(e, lessonId,data.avChatRoomId, this.state.uid, this.state.username,data.channelId)
  }

  render () {
    return (
            <div className={'all'}>
              <div className={'chatBox'}>
                <div className={'livePlay'}>
                  <div className={'live'}>
                    <LivePlay id={'courseOne'} liveUrl={this.state.liveUrl}/>
                  </div>
                  <PlayControl oldHot={this.state.oldHot} oldCount={this.state.oldCount} showLogin={this.showLogin}  uid={this.state.uid} selectLive={this.changeCourse}
                               hot={this.state.hot} num={this.state.count} courseList={this.state.courseList}/>
                </div>
                <div className={'chat'}>
                  <div onClick={() => this.setState({ loginVisible: !this.state.loginVisible })} className={'other'}/>
                  <SingleMsg chatList={this.state.chatList}/>
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
