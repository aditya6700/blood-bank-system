import React from 'react';
import { NavLink } from 'react-router-dom';
import {Container, Nav, Navbar} from 'react-bootstrap';
import { Logout } from './Logout';

export default function NavigationBar({isAuthenticated, userId}) {

  const LoginLogout = () => {
    if (isAuthenticated) {
      return (
        <>
          <Logout userId={userId} />
        </>
      )
    }
    else {
      return (
        <>
          <NavLink className="nav-link" to="/register">Register</NavLink>
          <NavLink className="nav-link" to="/login">Login</NavLink>
        </>
      )
    }
  }
  
  return (
    <>
      <Navbar collapseOnSelect expand="md" bg="primary" data-bs-theme="dark">
      <Container>
        <Navbar.Brand>Transfuse Now</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <NavLink className="nav-link" aria-current="page" to="/about">About</NavLink>
            <LoginLogout />  
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  )
}
