import React from 'react';
import './playControl.scss'
import { Button, Col, Row, Select } from 'antd'
import { FireTwoTone, SmileTwoTone } from '@ant-design/icons'
import logo from '../../../image/18.png'
import logoT from '../../../image/9.png'

const {Option} = Select;

class PlayControl extends React.Component{
  constructor () {super()}
  render () {
    const { hot, num, courseList, selectLive, uid,showLogin,oldHot,oldCount } = this.props
    return(
            <div className={'liveInfo'}>
              {uid===''?<Button onClick={showLogin} type={'primary'}>登录</Button>:
              <>
                <Row style={{marginBottom:'10px'}} align={'middle'} gutter={20}>
                  <Col><img className={'logo'} src={logo}/> 新途径在线</Col>
                  <Col>
                    <div className={'hot'}><FireTwoTone/>热度：{hot}</div>
                  </Col><Col>
                  <div className={'hot'}><SmileTwoTone/>人数：{num}</div>
                </Col>
                </Row>
                <Row align={'middle'} gutter={20}>
                  <Col><img className={'logo'} src={logoT}/> 新途径教育</Col>
                  <Col>
                    <div className={'hot'}><FireTwoTone/>热度：{oldHot}</div>
                  </Col><Col>
                  <div className={'hot'}><SmileTwoTone/>人数：{oldCount}</div>
                </Col>
                </Row>
                <div className={'liveSelect'}>
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
                </div></>
              }
            </div>
    )
  }
}

export default PlayControl
