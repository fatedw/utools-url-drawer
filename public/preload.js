window.services = {
   upsertUrl: (code, urlKey, url, desc) => {
      if (!code || !urlKey || !url) {
         utools.showNotification('无效输入');
         return;
      }
      const insertUrl = {
         'key': code + ':' + urlKey,
         'code': code,
         'urlKey': urlKey,
         'url': url,
         'desc': desc,
         'pri': 1
      }
      let data = utools.db.get(code);
      if (!data) {
         data = {'_id': code, 'urls':[]};
         utools.setFeature({
            "cmds": [code],
            "code": code,
            "explain": `网页抽屉关键字`
         })
         data['urls'].push(insertUrl)
      } else {
         const urlData = data['urls']
         const index = urlData.findIndex((item) => urlKey === item.urlKey);
         if (index > -1) {
            insertUrl['pri'] = urlData[index]['pri']
            urlData.splice(index, 1, insertUrl);
         } else {
            urlData.push(insertUrl)
         }
      }
      utools.db.put(data);
   },

   saveCodeData: (data) => {
      utools.db.put(data);
   },

   queryCodeData: (code) => {
      return utools.db.get(code);
   },

   deleteCodeData: (code, urlKey) => {
      const data = utools.db.get(code);
      if (!data) {
         return;
      }
      const urlData = data['urls']
      const index = urlData.findIndex((item) => urlKey === item.urlKey);
      if (index > -1) {
         urlData.splice(index, 1);
         if (urlData.length === 0) {
            utools.removeFeature(code);
            utools.db.remove(code);
            return;
         }
         utools.db.put(data);
      }
   },

   queryAllData: () => {
      const data = []
      const features = utools.getFeatures() || [];
      for (const feature of features) {
         const codeData = utools.db.get(feature['code'])
         if (codeData) {
            data.push(codeData)
         }
      }
      return data;
   },

   queryAllCode: () => {
      const features = utools.getFeatures() || [];
      return features.map(feature => feature['code']);
   },

}