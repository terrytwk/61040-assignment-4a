# backend trace

```
Requesting.request {
  username: 'terrytwk',
  password: 'password',
  path: '/UserAuthentication/login'
} => { request: '019a4af4-3fc6-7c83-bbaf-6b2053cab82f' }


UserAuthentication.login { username: 'terrytwk', password: 'password' } => { user: '019a0dc3-71af-747a-a258-c4d3cc46061d' }


Requesting.respond {
  request: '019a4af4-3fc6-7c83-bbaf-6b2053cab82f',
  user: '019a0dc3-71af-747a-a258-c4d3cc46061d'
} => { request: '019a4af4-3fc6-7c83-bbaf-6b2053cab82f' }

[Requesting] Received request for path: /CustomerFeedback/create

Requesting.request {
  user: '019a0dc3-71af-747a-a258-c4d3cc46061d',
  order: 'general-feedback',
  comment: 'testing sync',
  path: '/CustomerFeedback/create'
} => { request: '019a4af4-5ef1-7fd0-b4f3-f41f223de56d' }


CustomerFeedback.create {
  user: '019a0dc3-71af-747a-a258-c4d3cc46061d',
  order: 'general-feedback',
  comment: 'testing sync'
} => { feedbackId: '019a4af4-5f0c-7675-84df-c19c6a910658' }


Requesting.respond {
  request: '019a4af4-5ef1-7fd0-b4f3-f41f223de56d',
  feedbackId: '019a4af4-5f0c-7675-84df-c19c6a910658'
} => { request: '019a4af4-5ef1-7fd0-b4f3-f41f223de56d' }

[Requesting] Received request for path: /UserProfile/setProfile

Requesting.request {
  user: '019a0dc3-71af-747a-a258-c4d3cc46061d',
  name: 'Terry Kim',
  classYear: '2026',
  major: '6-3',
  bio: 'I love coffee!!',
  favoriteDrink: 'cortado',
  favoriteCafe: 'George Howell',
  avatar: 'https://ui-avatars.com/api/?name=terrytwk&background=8B5CF6&color=fff&size=150',
  path: '/UserProfile/setProfile'
} => { request: '019a4af4-d8f5-7ebb-8ac2-8cd665ebc798' }


UserProfile.setProfile {
  user: '019a0dc3-71af-747a-a258-c4d3cc46061d',
  name: 'Terry Kim',
  classYear: '2026',
  major: '6-3',
  bio: 'I love coffee!!',
  favoriteDrink: 'cortado',
  favoriteCafe: 'George Howell',
  avatar: 'https://ui-avatars.com/api/?name=terrytwk&background=8B5CF6&color=fff&size=150'
} => {}


Requesting.respond { request: '019a4af4-d8f5-7ebb-8ac2-8cd665ebc798' } => { request: '019a4af4-d8f5-7ebb-8ac2-8cd665ebc798' }

[Requesting] Received request for path: /Order/open

Requesting.request { user: '019a0dc3-7222-7d9e-b393-fe8a1850c156', path: '/Order/open' } => { request: '019a4af5-131f-72df-b96d-142543e42f42' }


Order.open { user: '019a0dc3-7222-7d9e-b393-fe8a1850c156' } => { order: '019a4af5-1336-7e6f-ad5b-334092c70976' }


Requesting.respond {
  request: '019a4af5-131f-72df-b96d-142543e42f42',
  order: '019a4af5-1336-7e6f-ad5b-334092c70976'
} => { request: '019a4af5-131f-72df-b96d-142543e42f42' }

[Requesting] Received request for path: /Order/addItem

Requesting.request {
  order: '019a4af5-1336-7e6f-ad5b-334092c70976',
  item: '019a0dc3-73ad-7cc2-bb71-56e85fd96b32',
  qty: 1,
  displayItemName: 'Latte',
  selections: [
    {
      option: '019a0dc3-72cc-711b-9a43-b1d02a0ae2a2',
      choice: '019a0dc3-734a-7624-9d7e-5b7a133ed9f7',
      displayOptionName: 'Temperature',
      displayChoiceName: 'iced'
    },
    {
      option: '019a0dc3-72ef-73c1-8a64-1393634b7f3c',
      choice: '019a0dc3-7397-7b44-bed0-4af4111ac1c7',
      displayOptionName: 'Milk',
      displayChoiceName: 'oat'
    }
  ],
  path: '/Order/addItem'
} => { request: '019a4af5-1f8e-70c7-ace0-8dfec1dcf374' }


Order.addItem {
  order: '019a4af5-1336-7e6f-ad5b-334092c70976',
  item: '019a0dc3-73ad-7cc2-bb71-56e85fd96b32',
  qty: 1,
  displayItemName: 'Latte',
  selections: [
    {
      option: '019a0dc3-72cc-711b-9a43-b1d02a0ae2a2',
      choice: '019a0dc3-734a-7624-9d7e-5b7a133ed9f7',
      displayOptionName: 'Temperature',
      displayChoiceName: 'iced'
    },
    {
      option: '019a0dc3-72ef-73c1-8a64-1393634b7f3c',
      choice: '019a0dc3-7397-7b44-bed0-4af4111ac1c7',
      displayOptionName: 'Milk',
      displayChoiceName: 'oat'
    }
  ]
} => { line: '019a4af5-1fbb-76a0-a91c-c78c9aee692f' }


Requesting.respond {
  request: '019a4af5-1f8e-70c7-ace0-8dfec1dcf374',
  line: '019a4af5-1fbb-76a0-a91c-c78c9aee692f'
} => { request: '019a4af5-1f8e-70c7-ace0-8dfec1dcf374' }

[Requesting] Received request for path: /Order/submit

Requesting.request {
  order: '019a4af5-1336-7e6f-ad5b-334092c70976',
  path: '/Order/submit'
} => { request: '019a4af5-2050-7229-84ed-eda75cd513d9' }


Order.submit { order: '019a4af5-1336-7e6f-ad5b-334092c70976' } => {}


Requesting.respond { request: '019a4af5-2050-7229-84ed-eda75cd513d9' } => { request: '019a4af5-2050-7229-84ed-eda75cd513d9' }
```