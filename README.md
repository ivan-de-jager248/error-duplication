# Error duplication

1. Install dependencies `npm install`
2. `encore run`
3. Open `localhost:9400`, and register a user at `auth.register` endpoint.
4. Login at `auth.login` and save jwt in authorization data as `bearer <jwt>`
5. ![example](<Screenshot 2024-12-26 at 06.48.37.png>)
6. Create org at `organization.createOrg` endpoint
   1. Notice successful response containing the created org
   2. Also notice in the terminal numbers being logged indicating the progress of the program.
7. Open `organization.test.ts`, notice `organization.createOrg` being called and the response being verified.
8. Run `encore.test`
   1. Notice logged numbers get no further than **2**

For some reason, calling the endpoint from `encore.run` works perfectly, but in testing fails.