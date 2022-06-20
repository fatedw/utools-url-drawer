import { SearchOutlined } from '@ant-design/icons';
import { Form, Input, Popconfirm, Table, Typography } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  save,
  index,
  children,
  ...restProps
}) => {
  let rules = []
  
  if (dataIndex === 'code' || dataIndex === 'urlKey') {
    rules.push({
      required: true,
      message: `请输入${title}`
    })
  }
  if (dataIndex === 'url') {
    rules.push({ type: 'url', message: '请输入正确的URL链接' })
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={rules}
        > 
        {
          dataIndex === 'url' ? 
          <Input.TextArea onPressEnter = {() => save(record)}/> : <Input onPressEnter = {() => save(record)}/>
        }
          
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const UrlDrawerManage = () => {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState([]);
  const [codeData, setCodeData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [searchText, setSearchText] = useState('');
  const searchInput = useRef(null);

  const isEditing = (record) => record.key === editingKey;

  useEffect(()=>{
    const allUrls = window.services.queryAllData();
    setCodeData(window.services.queryAllCode());
    const data = [];
    for (const urlData of allUrls) {
      const urls = urlData['urls'];
      data.push(...urls);
    }
    setTableData(data);
  },[]) 

  const edit = (record) => {
    form.setFieldsValue({
      code: '',
      key: '',
      url: '',
      desc: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (record) => {
    try {
      const row = await form.validateFields();
      const newData = [...tableData];
      console.log(record)
      const index = newData.findIndex((item) => record["key"] === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setTableData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setTableData(newData);
        setEditingKey('');
      }
      window.services.upsertUrl(row['code'], row['urlKey'], row['url'], row['desc'])
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const del = (record) => {
    setTableData(tableData.filter((item) => record.key !== item.key));
    window.services.deleteCodeData(record.code, record.urlKey)
  };
  

  const handleSearch = (setSelectedKeys, val, confirm, clearFilters) => {
    if (!val) {
      setSelectedKeys([]);
      clearFilters();
    } else {
      setSelectedKeys([val])
    }
    confirm({
      closeDropdown: false,
    });
    setSearchText(val);
  };

  const columns = [
    {
      title: '抽屉名',
      dataIndex: 'code',
      width: '15%',
      editable: true,
      filters: codeData.map(code => {return { text: code, value: code}}),
      onFilter: (value, record) => record.code.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '关键字',
      dataIndex: 'urlKey',
      width: '15%',
      editable: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div
          style={{
            padding: 8,
          }}
        >
          <Input
            ref={searchInput}
            placeholder="搜索"
            value={selectedKeys[0]}
            onChange={(e) => handleSearch(setSelectedKeys, e.target.value, confirm, clearFilters)}
            allowClear
          />
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? '#1890ff' : undefined,
          }}
        />
      ),
      onFilter: (value, record) =>
        record["urlKey"].toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (text) =>
        <Highlighter
        highlightStyle={{
          backgroundColor: '#59f2a6',
          padding: 0,
        }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    },
    {
      title: '链接',
      dataIndex: 'url',
      width: '30%',
      editable: true,
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'desc',
      width: '30%',
      editable: true,
      ellipsis: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record)}
              style={{
                marginRight: 8,
              }}
            >
              保存
            </Typography.Link>
            <Typography.Link onClick={() => cancel()}>取消</Typography.Link>
          </span>
        ) : (
          <span>
            <Typography.Link 
              disabled={editingKey !== ''} 
              onClick={() => edit(record)}
              style={{
                marginRight: 8,
              }}>
              编辑
            </Typography.Link>
            <Popconfirm title="确认删除?" onConfirm={()=>del(record)} okText="是" cancelText="否">
              <a>删除</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        save
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={tableData}
        columns={mergedColumns}
        rowClassName="draw-table"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};

export default UrlDrawerManage;