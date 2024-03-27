import React from 'react';
import { Button, Form, Input, AutoComplete } from 'antd';


export default class UrlDrawerAdd extends React.Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef();
    window.utools.setExpendHeight(400);
    this.state = {
      allUrls: []
    }
  }

  componentDidMount() {
    const allData = window.services.queryAllData()
    this.setState({ allUrls: allData })
    if (this.props.type === 'window') {
      window.utools.readCurrentBrowserUrl().then((url) => {
        if (!url) {
          window.utools.outPlugin()
          utools.showNotification('获取URL失败');
          return
        }
        this.formRef.current.setFieldsValue({
          url: url,
        });
      })      
    } else if (this.props.type === 'regex') {
      this.formRef.current.setFieldsValue({
        url: this.props.payload,
      });
    }

  }

  saveUrl = (values) => {
    const code = values['code']
    window.services.upsertUrl(code, values['urlKey'], values['url'], values['desc'])
    window.utools.showNotification(`添加成功, 抽屉名: ${code}, 关键字: ${values['urlKey']}`);
    window.utools.outPlugin();
    window.utools.hideMainWindow();
  }

  render() {
    const { allUrls } = this.state
    return (
      <Form
      name="form"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
      onFinish={this.saveUrl}
      autoComplete="off"
      size="large"
      ref={this.formRef}
    >
      <Form.Item
        id="code-input"
        label="抽屉名"
        name="code"
        rules={[{ required: true, message: '请输入抽屉名'}]}
      >
        <AutoComplete
          options={allUrls.map((option) => {
            return {'value': option['_id']}
          })}
          placeholder="添加后可直接在utools中检索"
          filterOption={(inputValue, option) =>
            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </Form.Item>

      <Form.Item
        id="key-input"
        label="关键字"
        name='urlKey'
        rules={[{ required: true, message: '请输入关键字' }]}
      >
        <Input placeholder="可在抽屉名中二次检索"/>
      </Form.Item>
      <Form.Item
        id="url-input"
        label="链接"
        name="url"
        rules={[{ required: true, message: '请输入链接'},{ type: 'url', message: '请输入正确的URL链接' }]}
      >
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="http/https开头的完整url"/>
      </Form.Item>
      <Form.Item
        id="desc-input"
        label="描述"
        name="desc"
      >
        <Input placeholder="网页功能的简单描述"/>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
        <Button type="primary" htmlType="submit" block>
        保存
        </Button>
      </Form.Item>
    </Form>
    )
  }
}
