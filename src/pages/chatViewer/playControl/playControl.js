import React from 'react'
import './playControl.scss'
import { Button, Col, Row, Select, Input, message,Switch } from 'antd'
import { FireTwoTone, SmileTwoTone,CheckOutlined,CloseOutlined } from '@ant-design/icons'
import logo from '../../../image/18.png'
import logoT from '../../../image/9.png'
import axios from 'axios'

const { Option } = Select
const { TextArea } = Input

class PlayControl extends React.Component {
  constructor (props) {
    super()
    this.state = {
      inputNotice: '',
      inputMsg: '',
      allBanState:false
    }
  }
  componentDidMount () {

  }
  setNotice () {
    if (this.state.inputNotice === '') {
      message.info('请输入内容后更新公告')
      return
    }
    axios.get(`https://api.xtjzx.cn/course_manager/api/course/notice?course_id=${this.props.id}&content=${this.state.inputNotice}`).then(_ => {
      message.success('更新成功,稍后将展示')
      this.setState({ inputNotice: '' })
    })
  }

  render () {
    const { hot, num, courseList, selectLive, uid, showLogin, oldHot, oldCount,logout,channelId } = this.props
    // this.getBanState(channelId)
    return (
            <div className={'liveInfo'}>
              {uid === '' ? <Button onClick={showLogin} type={'primary'}>登录</Button> :
                      <>
                        <div className={'userInfo'}>
                          <h3>登录用户</h3>
                          <Row style={{position:'relative'}} align={'middle'}>
                            <Col><img className={'avatar'} src={this.props.avatar}
                                      alt={'用户头像'}/></Col><Col style={{fontSize:'20px'}}>{this.props.nickName}</Col>
                            <Button className={'logout'} onClick={logout} type="danger" key="exit">退出</Button>
                          </Row>
                        </div>
                        <div className={'liveSelect'}>
                          <h3>课程选择</h3>
                          <Row gutter={20} align={'middle'}>
                            <Col><Select
                                    showSearch
                                    style={{ width: 300 }}
                                    placeholder="选择一个课程"
                                    optionFilterProp="children"
                                    onChange={selectLive}
                                    filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                            >
                              {courseList.map(item => {
                                return <Option value={item.Id} key={item.Id}>{item.name}</Option>
                              })}
                            </Select></Col>
                          </Row>
                        </div>
                        <Row>
                          <h3>热度信息</h3>
                        </Row>
                        <Row style={{ marginBottom: '10px' }} align={'middle'} gutter={20}>
                          <Col><img alt={'logo'} className={'logo'} src={logo}/> 新途径在线</Col>
                          <Col>
                            <div className={'hot'}><FireTwoTone/>热度：{hot}</div>
                          </Col>
                          <Col>
                            <div className={'hot'}><SmileTwoTone/>人数：{num}</div>
                          </Col>
                        </Row>
                        <Row style={{ marginBottom: '20px' }} align={'middle'} gutter={20}>
                          <Col><img alt={'logo'} className={'logo'} src={logoT}/> 新途径教育</Col>
                          <Col>
                            <div className={'hot'}><FireTwoTone/>热度：{oldHot}</div>
                          </Col><Col>
                          <div className={'hot'}><SmileTwoTone/>人数：{oldCount}</div>
                        </Col>
                        </Row>

                        <div className={'noticeSet'}>
                          <h3>公告设置</h3>
                          <TextArea placeholder={'输入内容以更新新途径在线公告'} value={this.state.inputNotice}
                                    onChange={_ => this.setState({ inputNotice: _.target.value })} showCount
                                    maxLength={200}/>
                          <Button onClick={this.setNotice.bind(this)} style={{ marginTop: '5px' }}
                                  type="primary">更新公告</Button>
                        </div>
                      </>
              }
            </div>
    )
  }
}

export default PlayControl
