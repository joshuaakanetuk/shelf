import React, { useState } from 'react';
import './App.css'; // Optional CSS for styling

// Component to search books using the Google Books API
function SearchBooks({ onAddBook }: { onAddBook: (book: any) => void }) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('Error fetching search results.');
        setLoading(false);
      });
  };

  const handleAddFromSearch = (bookData) => {
    // Construct a book object matching our app's structure.
    const newBook = {
      id: bookData.id,
      title: bookData.volumeInfo.title,
      author: bookData.volumeInfo.authors
        ? bookData.volumeInfo.authors.join(', ')
        : '',
      read: false,
    };
    onAddBook(newBook);
  };

  return (
    <div className="search-books">
      <h2>Search for Books</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter a title or keyword"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}
      <div className="search-results">
        {results.length === 0 && !loading ? (
          <p>No results found. Try a different search.</p>
        ) : (
          <ul>
            {results.map((book) => (
              <li key={book.id}>
                <span>
                  <strong>{book.volumeInfo.title}</strong>
                  {book.volumeInfo.authors &&
                    ` by ${book.volumeInfo.authors.join(', ')}`}
                </span>
                <button onClick={() => handleAddFromSearch(book)}>
                  Add to List
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  // Handler to add a new book manually
  const handleAddBook = (e) => {
    e.preventDefault();
    if (title.trim() === '') return;

    const newBook = {
      id: Date.now(), // simple unique id using current time
      title: title.trim(),
      author: author.trim(),
      read: false,
    };

    setBooks([...books, newBook]);
    setTitle('');
    setAuthor('');
  };

  // Handler to add a book from the search results
  const addBookFromSearch = (book) => {
    // Optionally check for duplicates here
    setBooks([...books, book]);
  };

  // Toggle the read status of a book by id
  const toggleReadStatus = (id) => {
    const updatedBooks = books.map((book) =>
      book.id === id ? { ...book, read: !book.read } : book
    );
    setBooks(updatedBooks);
  };

  // Delete a book from the list by id
  const deleteBook = (id) => {
    const updatedBooks = books.filter((book) => book.id !== id);
    setBooks(updatedBooks);
  };

  // Filter books into unread and read categories
  const booksToRead = books.filter((book) => !book.read);
  const booksRead = books.filter((book) => book.read);

  return (
    <div className="App">
      <h1>My Book List</h1>

      {/* Search Books Component */}
      <SearchBooks onAddBook={addBookFromSearch} />

      {/* Manual Add Book Form */}
      <div className="manual-add">
        <h2>Add a Book Manually</h2>
        <form onSubmit={handleAddBook} className="book-form">
          <input
            type="text"
            placeholder="Book title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Author (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <button type="submit">Add Book</button>
        </form>
      </div>

      {/* Display Books Sections */}
      <div className="book-sections">
        <section>
          <h2>Books to Read</h2>
          {booksToRead.length === 0 ? (
            <p>No books added yet.</p>
          ) : (
            <ul>
              {booksToRead.map((book) => (
                <li key={book.id}>
                  <span>
                    <strong>{book.title}</strong>
                    {book.author && ` by ${book.author}`}
                  </span>
                  <div className="actions">
                    <button onClick={() => toggleReadStatus(book.id)}>
                      Mark as Read
                    </button>
                    <button onClick={() => deleteBook(book.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Books Read</h2>
          {booksRead.length === 0 ? (
            <p>No books marked as read yet.</p>
          ) : (
            <ul>
              {booksRead.map((book) => (
                <li key={book.id}>
                  <span>
                    <strong>{book.title}</strong>
                    {book.author && ` by ${book.author}`}
                  </span>
                  <div className="actions">
                    <button onClick={() => toggleReadStatus(book.id)}>
                      Mark as Unread
                    </button>
                    <button onClick={() => deleteBook(book.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
