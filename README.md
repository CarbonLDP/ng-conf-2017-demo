# NG-Conf 2017 Product Demo

Product Demo for NG-Conf 2017.

## Setup

- `npm install`
- Make sure you have a running `carbonldp-platform`
- Prepare the default data by running (modify the command as needed):

	```
	npm run script:build_app -- \
		--protocol http \
		--domain localhost:8083 \
		--user your@agent-email.com \
		--password YoURP344word`
	```
	
- Run the application: `npm start`

## License

	Copyright (c) 2015-present, Base22 Technology Group, LLC.
	All rights reserved.

	This source code is licensed under the BSD-style license found in the
	LICENSE file in the root directory of this source tree.
