### Task: Setting Up the Server with Express, Listening on Port 8000, and Creating Book Routes

---

#### Step 1: Project Initialization

1. **Create Project Folder**: Start by creating a new folder for the project, such as `node-express-server`.
2. **Initialize Node.js Project**: In the terminal, run `npm init -y` to initialize a Node project and create a `package.json` file.
3. **Install Express**: Run `npm install express` to add Express to the project.
4. **Create `index.js` File**: This will be your main entry point.

#### Step 2: Set Up Basic Express Server

1. **Import Express**: In `index.js`, import the Express module.
2. **Create Express App**: Use `const app = express();` to initialize the Express app.
3. **Set Up a Port**: Define a constant, `const PORT = 8000;`, to store the port number.
4. **Listen on Port**: Use `app.listen(PORT, () => {...});` to make the server listen on port 8000, logging a confirmation message.

#### Step 3: Create Book Data

1. **Create a Mock Book Array**: Define a simple array, `const books = [...]`, containing sample book objects. Each book should have an `id`, `title`, and `author`.

   ```javascript
   const books = [
     { id: 1, title: 'Book One', author: 'Author One' },
     { id: 2, title: 'Book Two', author: 'Author Two' },
   ];
   ```

#### Step 4: Set Up GET Route to Fetch All Books

1. **Define a Route**: Use `app.get('/books', (req, res) => {...});` to create a route for fetching all books.
2. **Send Book Data**: In the route handler, use `res.json(books);` to send the entire array of books as JSON.

#### Step 5: Set Up GET Route to Fetch a Book by ID

1. **Use Path Parameter**: Define a route with a path parameter using `app.get('/books/:id', (req, res) => {...});`.
2. **Retrieve Book ID**: Extract the `id` from `req.params`.
3. **Find Book**: Use `books.find()` to search for the book by `id`.
4. **Handle Not Found**: If no book is found, send a `404` response with a relevant message.
5. **Return Book**: If the book exists, send it in the response.

#### Step 6: Set Up POST Route to Add a New Book

1. **Use Middleware**: Add `app.use(express.json());` to parse JSON bodies.
2. **Define POST Route**: Use `app.post('/books', (req, res) => {...});` for adding a new book.
3. **Receive Book Data**: Access the new book data from `req.body`.
4. **Generate New ID**: Set an ID by incrementing the last book’s ID or using a random method.
5. **Add Book to Array**: Push the new book into the `books` array.
6. **Send Success Response**: Respond with the updated book list or a success message.

#### Step 7: Set Up DELETE Route to Remove a Book by ID

1. **Define DELETE Route**: Use `app.delete('/books/:id', (req, res) => {...});`.
2. **Retrieve Book ID**: Extract `id` from `req.params`.
3. **Find and Remove Book**: Use `books.filter()` to exclude the book with the matching `id`.
4. **Check Deletion**: If no book was deleted, send a `404` response.
5. **Send Confirmation**: Return a success message indicating the book was deleted, or send the updated book list.

#### Step 8: Test the Routes

1. **Start the Server**: Run `node index.js` and check for the confirmation message.
2. **Use Postman or cURL**: Demonstrate how to test each route using Postman or cURL:
   - `GET /books`
   - `GET /books/:id`
   - `POST /books`
   - `DELETE /books/:id`

---

This step-by-step breakdown will guide your students through setting up and testing a basic Express server with routes for managing a collection of books. Let me know if you'd like to add any advanced steps!
