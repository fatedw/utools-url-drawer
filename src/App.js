import React from 'react'
import './index.less'
import { ConfigProvider, theme } from 'antd';

import UrlDrawerManage from './UrlDrawerManage'
import UrlDrawerAdd from './UrlDrawerAdd'
import UrlDrawerList from './UrlDrawerList'

export default class App extends React.Component {
  state = {
    appTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    enter: null
  }

  componentDidMount() {
    window.utools.onPluginEnter(enter => {
      this.setState({
        enter
      })
    })
    window.utools.onPluginOut(() => {
      this.setState({
        enter: null
      })
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setState({
        appTheme: e.matches ? 'dark' : 'light'
      })
    })
  }

  getEnterPage = (enter) => {
    switch (enter.code) {
      case 'UrlDrawerAdd':
        return <UrlDrawerAdd {
          ...enter
        }
        />
      case 'UrlDrawerManage':
        return <UrlDrawerManage {
          ...enter
        }
        />
      default:
        return <UrlDrawerList {
          ...enter
        }
        />
    }
  }

  render() {
    const {
      enter,
      appTheme
    } = this.state
    if (!enter) return false
    return ( 
      <ConfigProvider
        theme={{
          algorithm: appTheme == 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
        }}
      >
        <div className='app-page'>{this.getEnterPage(enter)}</div>
      </ConfigProvider>
    )
  }
}