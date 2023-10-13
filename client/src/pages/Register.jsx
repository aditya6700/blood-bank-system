import React, { useState } from 'react';
import { Container, Row, Form, FloatingLabel, Button, Card, Col } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { Link } from 'react-router-dom';

export const Register = () => {

  const [userDetails, setUserDetails] = useState({
    name: "", email: "", password: "", cpassword: ""
  })

  const handleChange = (event) => {
    const { name, value } = event.target;
    return setUserDetails({ ...userDetails, [name]: value });
  }

  const validateUserDetails = () => {
    const { name, email, password, cpassword } = userDetails;
    console.log(userDetails);

    let validated = true;

    const nameRegex = /^[a-zA-z0-9_ ]{3,15}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.!@#$%^&*-])[a-zA-Z\d.!@#$%^&*-]{8,16}$/;


    if (!nameRegex.test(name)) {
      alert(
				"Username should be greater than 3 chars. Special chars allowed space and underscore",
      );
      validated = false;
    }

    if (!emailRegex.test(email)) {
      alert(
				"Invalid email",
      );
      validated = false;
    }

    if (!passwordRegex.test(password)) {
      alert(
				"Password should be min of 8 and max 16. Should follow standard password rules",
      );
    validated = false;
    }

    if (!password.match(cpassword)) {
      alert(
				"Passwords does not match",
      );
      validated = false;
    }

    return validated;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateUserDetails()) {
      alert('form validated')
    }
  }

  return (
    <>
      <NavigationBar />
      <Container className='form-container' fluid="md" >
        <Row className="d-flex justify-content-center align-items-center full-height-row">
          <Col md={8} lg={6} xs={12}>
            <div className="border border-3 border-primary"></div>
            <Card className="shadow">
              <Card.Body>
                <div className="mb-3 mt-4">
                  <h2 className="fw-bold mb-2 text-uppercase">BLOOD BANK</h2>
                  <p className="mb-3">Please enter your details to become a Transfuser!</p>
                  <Form className="mb-3" onSubmit={handleSubmit}>
                      
                    <Form.Group className="mb-3">
                      <FloatingLabel controlId="name" label="Name" >
                        <Form.Control type="text" placeholder="Dream Fuel" name="name" onChange={handleChange} required />
                      </FloatingLabel> 
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <FloatingLabel controlId="email" label="Email address"  >
                        <Form.Control type="email" placeholder="name@example.com" name="email" onChange={handleChange} required />
                      </FloatingLabel> 
                    </Form.Group>
                      
                    <Row className="mb-2">
                      <Form.Group className="mb-3" as={Col}>
                        <FloatingLabel controlId="password" label="Password" >
                          <Form.Control type="password" placeholder="secret" name="password" onChange={handleChange} required />
                        </FloatingLabel> 
                      </Form.Group>

                      <Form.Group className="mb-3" as={Col}>
                        <FloatingLabel controlId="cpassword" label="Confirm Password" >
                          <Form.Control type="password" placeholder="secret" name="cpassword" onChange={handleChange} required />
                        </FloatingLabel> 
                      </Form.Group>
                    </Row>

                    <div className="d-grid">
                      <Button variant="primary" type="submit">
                        Become a Transfuser
                      </Button>
                    </div>
                      
                    <div className="mt-3">
                      <p className="mb-0  text-center">
                        Already a Transfuser?{" "}
                        <Link className="text-primary fw-bold" to='/login' >Login</Link>
                      </p>
                    </div>
                  </Form>

                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container> 
    </>
  );
}