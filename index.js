const { ApolloServer, gql } = require('apollo-server')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'test'


mongoose.set('useFindAndModify', false)
/**
 * Kept the username password for demo purpose.Will be fixed through enviroment variable
 */
const MONGODB_URI = 'mongodb+srv://test:testing20@cluster0-sjxwf.mongodb.net/test?retryWrites=true&w=majority'
console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true,useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
type Author {
  name: String!
  id: ID!
  born: Int
  bookCount: Int!
}
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}
type Token {
  value: String!
}
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres:[String!]!
  }
  type Query{
    bookCount: Int!
    authorCount: Int!
    allBooks:[Book!]
    allAuthors: [Author!]
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String
      genres: [String!]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`


const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root,args) => {return Book.find({})},
    //allAuthors: () => authors.map(author => ({name: author.name, born: author.born, bookCount: books.filter( book => author.name === book.author).length}))
    allAuthors:() => {return Author.find({})},
    me: (root, args, context) => {
      console.log(context.currentUser)
      return context.currentUser
    }
  },
  Mutation: {
    addBook:async (root,args,context) => {
    const currentUser = context.currentUser
    if (!currentUser) {
      throw new AuthenticationError("not authenticated")
    }
    const findAuthor  = await Author.findOne({name:args.author})
      if(!findAuthor){
        console.log("author not found..")
        const addAuthor = new Author({name:args.author, born:null})
        try {
          await addAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
         }

        const book = new Book({...args, author:addAuthor})
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
         }
         return book
      }
      const book = new Book({...args, author:findAuthor})
      console.log(book)
     try {
       await book.save()
     } catch (error) {
      throw new UserInputError(error.message, {
        invalidArgs: args,
      })
     }
     return book
    },
    editAuthor:async (root,args,context) => {
    const currentUser = context.currentUser
    if (!currentUser) {
      throw new AuthenticationError("not authenticated")
    }
      let author = await Author.findOne({name:args.name})
      author.born = args.setBornTo
      try{
        await author.save()
      }catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
    }
    return author
  },
  createUser: async (root,args) => {
    const user = new User({username: args.username,favoriteGenre:args.favoriteGenre })
    try {
      await user.save()
    } catch (error) {
      
    }
    return user
  },

  login: async(root,args) => {
    const user = await User.findOne({username:args.username})
    if(!user || args.password !== JWT_SECRET){
     return "no user found" 
    }
    const tokenize = {username: user.username, id:user._id}
    return {value: jwt.sign(tokenize,JWT_SECRET)}
  }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    console.log("this is auth",auth)
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      console.log("user===>",currentUser)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
