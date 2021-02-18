import React,{useState} from 'react';
import {ListGroup,Col,OverlayTrigger,Popover,Spinner,Tabs,Tab, Container,Navbar,Button,Card, Form, Row, Badge, CardColumns, Jumbotron} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import TimeAgo from './TimeAgo';
import Swal from 'sweetalert2';
import icon from './icon.png';
import kadum from './kadum.jpg';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Initialize Firebase
firebase.initializeApp({
  //put your own api bitch
});

const auth = firebase.auth();
const firestore = firebase.firestore();

const App = () =>{
 
  const [user,loading] = useAuthState(auth);

  const signInWithGoogle = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();//firebase
    auth.signInWithPopup(provider);//hooks
  }

  return(
        <Container>
         
          <Container >
            
            <Navbar>
              <Navbar.Brand ><strong><img src={icon} style={{with:'50px',height:'50px'}} alt="todo list icon"/> PENTODO</strong></Navbar.Brand>
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  {loading?
                  <Spinner variant="primary" animation="border" role="status">
                    <span className="sr-only">Loading...</span> 
                  </Spinner>:
                  user?
                    <>&nbsp;
                    <OverlayTrigger trigger="hover" key="bottom" placement="bottom" overlay={
                      <Popover id={`popover-positioned-bottom`}>
                        <Popover.Title as="h3">Hi iam {auth.currentUser.displayName}</Popover.Title>
                        <Popover.Content>
                          <strong>Holy Moly!</strong> Iam cool.
                        </Popover.Content>
                      </Popover>}>
                        <img style={{width:"40px",height:"40px",borderRadius:"50%"}} src={auth.currentUser.photoURL} alt={auth.currentUser.displayName}/>
                    </OverlayTrigger> &nbsp;&nbsp;&nbsp;<Badge variant="danger" style={{cursor:"pointer"}} onClick={()=>auth.signOut()}>SignOut</Badge> 
                      </>:
                    <Button onClick={signInWithGoogle} variant="dark" size="sm">Sign in with Google</Button>}
                </Navbar.Text>
              </Navbar.Collapse>
            </Navbar>

          {user&&
            <Tabs defaultActiveKey="home" id="uncontrolled-tab-example">
              <Tab eventKey="home" title="Home">
                <CardColumns>
                  <Post />
                </CardColumns>
              </Tab>
              <Tab eventKey="profile" title="Your Task">
                <Home user={user}/>
                {user &&<TodoData/>}
              </Tab>
              <Tab eventKey="developer" title="Developer">
                <Developer />
              </Tab>
            </Tabs>
          }

          {!user&&!loading&&
            <Jumbotron>
            <h1>Welcome to PenTodo!</h1>
            <p>
              This is a todo task list where you will be able to view other user's task list and
              you can still have your task by yourself.
            </p>
            <p>
              <Button variant="danger" onClick={signInWithGoogle}>Get stated by signing in with google</Button>
              <Button href="https://github.com/kadmon47/PenTodo" style={{marginLeft:"12px"}} title="github code">Go to code</Button>
              <Button href="https://github.com/kadmon47" style={{marginLeft:"12px"}} title="github code">Developer Page - GitHub</Button>
            </p>
          </Jumbotron>
          }
            

          </Container> 
   
        </Container>
  );
}

const Developer = () =>{
  return(
      <div style={{marginTop:"10px",display:"flex",justifyContent:"center",alignItems:"center"}}>
       <Card style={{maxWidth:'400px'}}>
  <Card.Img variant="top" src={kadum} />
  <Card.Body>
    <Card.Title>Kadum Komut</Card.Title>
    <Card.Text>
       github - <a href="https://github.com/kadmon47">https://github.com/kadmon47</a>
    </Card.Text>
    <Button variant="primary" href="https://github.com/kadmon47/PenTodo">Go to code</Button>
  </Card.Body>
</Card>
</div>
  );
}

const Post = ()=>{
  const [post,loading] = useCollectionData(firestore.collection('home'),{idField:"id"});
  return(<>
    {
      loading?<Spinner variant="primary" animation="border" role="status"><span className="sr-only">Loading...</span> </Spinner>:
        post&&post.map(list=>(
          <PostList createdAt={list.createdAt} text={list.text} complete={list.completed} uid={list.uid} photo={list.photo} name={list.name} key={list.id}/>
        ))
    }
    </>
  );
}

const PostList = ({createdAt,text,complete,uid,photo,name}) =>{
  return(
    <Card bg="light " text="black"  style={{marginTop:"10px"}}>
      <Card.Header as="h5" style={{color:"grey"}}><img src={photo} alt={name} style={{width:'30px',height:"30px",borderRadius:"50%"}}/> {name}</Card.Header>
      <Card.Body>
        <Card.Text>
          {text}
        </Card.Text>
        <Button variant={complete?'success':'danger'} size="sm">{complete?<><span>completed</span> <i className="far fa-check-circle"></i></>:<><span>Not completed</span> <i className="fas fa-clock"></i></>}</Button>
      </Card.Body>
      <Card.Footer>
        <small>{new Date(createdAt).toString().slice(4,24)}</small>
      </Card.Footer>
    </Card>
  );
}

const Home = ({user})=>{
  const [data,setData] = useState("");
  const submitTask = (e) =>{
    e.preventDefault();
    if(data==="") return;
    Swal.fire({
      title:"Add Todo",
      text:data,
      icon:'question',
      confirmButtonText:"Add",
      showCancelButton:true,
      preConfirm:async()=>{
         return await firestore.collection('todoList').doc(auth.currentUser.uid).collection('list').add({
           text:data,
           createdAt:Date.now(),
           completed:false
         }).then(async(snap)=>{
           await firestore.collection('home').doc(snap.id).set({
            text:data,
            createdAt:Date.now(),
            completed:false,
            uid:auth.currentUser.uid,
            photo:auth.currentUser.photoURL,
            name:auth.currentUser.displayName
           })
         });
      },
      showLoaderOnConfirm:true
    }).then(res=>{
      if(res.value){
        Swal.fire('Task Added','','success');
        setData("");
      }
    })
    
}
  return(
    <>
    <Form onSubmit={submitTask} style={{marginTop:"5px"}}>
    <Form.Group>
      <Form.Control type="text" value={data} onChange={(e)=>setData(e.target.value)} placeholder="type your task . . ."/>
      <Form.Text className="text-muted">
        {user?<>Your todo list will be secure with us!</>:<>Please signed in to add task.</>}
      </Form.Text>
    </Form.Group>
  </Form>
  </>
  );
}

const TodoData = () =>{

  const ref = firestore.collection('todoList').doc(auth.currentUser.uid).collection('list');
  const [todoData,todoDataLoading] = useCollectionData(ref.orderBy('createdAt','desc'),{idField:"id"});

  const completeTask = (id) =>{
    Swal.fire({
      title:"Do you want to set this task to completed?",
      icon:"question",
      confirmButtonText:"Complete",
      cancelButtonText:"Not yet!",
      showCancelButton:true,
      showLoaderOnConfirm:true,
      preConfirm:async()=>{
        return await ref.doc(id).update({
          completed:true
        }).then(async()=>{
            return await firestore.collection('home').doc(id).update({
              completed:true
            })
        })
      }
    }).then(res=>{
      if(res.value){
        Swal.fire('Task Completed','','success');
      }
    }) 
  }

  const removeTask = (id)=>{
    Swal.fire({
      title:"Do you want to remove this task?",
      icon:"question",
      confirmButtonText:"Remove",
      showCancelButton:true,
      showLoaderOnConfirm:true,
      preConfirm:async()=>{
        return await ref.doc(id).delete().then(async()=>{
          return await firestore.collection('home').doc(id).delete();
        });
      }
    }).then(res=>{
      if(res.value){
        Swal.fire('Task Deleted','','success');
      }
    })
  }
  return (
      <>{
        todoDataLoading?<div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
        <Spinner variant="primary" animation="border" role="status"><span className="sr-only">Loading...</span> </Spinner></div>:
        <ListGroup as="ul">
          {todoData&&todoData.map((list)=>(
            <List completeTask={completeTask} createdAt={list.createdAt} id={list.id} removeTask={removeTask} text={list.text} complete={list.completed} key={list.id}/>
          ))}
        </ListGroup>
      }
      </>
  );
}

const List = ({text,complete,completeTask,removeTask,createdAt,id}) =>{
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  return (
    <ListGroup.Item  className="animate__animated animate__bounceInDown" variant={complete?'success':'danger'}>
       
      <Row>
        <Col xs={12} sm={6} md={7} lg={8}>
          <span style={{textDecoration:complete?"line-through":null}}>{text}</span>&nbsp;
          {complete?
            <Badge variant="success">{new Date(createdAt).toString().slice(4,15)} {formatAMPM(new Date(createdAt))}</Badge>:
            <Badge variant="danger"><TimeAgo date={createdAt}/></Badge>
          }
        </Col>
        <Col sm={6} md={5} lg={4} style={{textAlign:"right"}}>
          {complete &&<Badge>completed <i className="far fa-check-circle"></i></Badge>}
          {!complete && 
            <Badge variant="danger" onClick={()=>completeTask(id)}  style={{cursor:'pointer'}}>
              Mark complete <i className="fas fa-plus-circle"></i>
            </Badge>}  
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Badge onClick={()=>removeTask(id)} style={{cursor:"pointer"}} variant="danger">Remove <i className="fas fa-backspace"></i></Badge>
        </Col>
      </Row>

    </ListGroup.Item>
  );
}
export default App;
