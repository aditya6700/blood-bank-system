import React, { useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import axios from 'axios';
import { bloodRequestRoute } from '../../utils/ApiRoutes';
import { NonVerfiedUser } from '../../components/NonVerfiedUser';
import { useAuthContext } from '../../hooks/useAuthContext';
import AppointmentScheduler from '../../components/AppointmentScheduler';

export const RequestBlood = () => {

  const { user } = useAuthContext();

  const [requestMade, setRequestMade] = useState(false);
  const [requestError, setRequestError] = useState(undefined);
  const [requestId, setRequestId] = useState('');

  const [requestDetails, setrRquestDetails] = useState({
    bloodGroup: user.bloodGroup, quantity: 0,disease: '', appointmentSlot: ''
  });
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    return setrRquestDetails({ ...requestDetails, [name]: value });
  }

  const api = axios.create({
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { bloodGroup, quantity, disease, appointmentSlot } = requestDetails;
    try {
      const userType = user?.userType;
      const userId = user?._id;
      const res = await api.post(`${bloodRequestRoute}/${userType}/request`, {
        bloodGroup, quantity, disease, userId, appointmentSlot: appointmentSlot + 'Z'
      });
      if (res.data.success) {
        setRequestMade(true);
        setRequestId(res.data.result);
      }
    }
    catch (error) {
      console.log("in error", error);
      setRequestError(error.response.data);
      setRequestMade(true);
    }
  };
  
  const handleRequestButton = () => {
    setRequestMade(false);
    setRequestId('');
    setRequestError(undefined);
    setrRquestDetails({
      bloodGroup: user.bloodGroup, quantity: 0, disease: '', appointmentSlot: ''
    });
  }

  return (
    <>
      <Container className='p-5 d-flex flex-column ' style={{ height: '100vh', overflowY: 'auto' }} >
        <Row>
          <h3 className="text-left fs-1 mb-3 text-capitalize">Request for blood</h3>
        </Row>
        {
          user && user.status === 'verified' ? 
          <Row>
          {
            requestMade ?
              <>
                <Col sm={8} md={6}>
                  {
                    !requestError ?
                      <>
                        <p className='text-success fw-bold'>Request had made successfully.</p>
                        <p className='mb-0'>Please go to request history section to view your status.</p>
                        <p><strong>Your request id:</strong> {requestId}</p>
                        <Button sm={{ span: 10, offset: 3 }} onClick={handleRequestButton}>Another Request</Button>
                      </> : 
                      <>
                        <p> <span className='text-danger fw-bold'>Error in making a request: </span></p>
                        <pre id="json">{JSON.stringify(requestError, undefined, 2)}</pre>
                        <Button sm={{ span: 10, offset: 3 }} onClick={handleRequestButton}>Request Again</Button>
                      </>
                  }
                  
                </Col>
              </> :
              <>
                <Col sm={10} lg={8}>
                  <Form onSubmit={handleSubmit} >
                    <Form.Group as={Row} className="mb-3" controlId="name">
                      <Form.Label column sm={3}>
                        Name
                      </Form.Label>
                      <Col sm={9}>
                        <Form.Control disabled readOnly className='border-2' type="text" placeholder="John" value={user.name} />
                      </Col>
                        </Form.Group>
                        
                    <Form.Group as={Row} className="mb-3" controlId="bloodGroup">
                      <Form.Label column sm={3}>
                        Blood Group
                      </Form.Label>
                      <Col sm={9}>
                        <Form.Control disabled readOnly className='border-2'  name="bloodGroup" type="text" value={user.bloodGroup} />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="disease">
                      <Form.Label column sm={3}>
                        Disease
                      </Form.Label>
                      <Col sm={9}>
                        <Form.Control className='border-2' name='disease' type="text" placeholder="your disease..." onChange={handleChange} required />
                      </Col>
                    </Form.Group>


                    <Form.Group as={Row} className="mb-3" controlId="quantity">
                      <Form.Label column sm={3}>
                          Quantity
                      </Form.Label>
                      <Col sm={9}>
                        <Form.Control className='border-2' min={1} max={10} type="number" placeholder="0" name="quantity" value={requestDetails.quantity} onChange={handleChange} required />
                      </Col>
                    </Form.Group>
                     
                    <AppointmentScheduler
                      handleChange={handleChange}
                      requestDetails={requestDetails}  
                      type='request'
                    />

                    <Form.Group as={Row} className="mb-3">
                      <Col sm={{ span: 10, offset: 3 }}>
                        <Button type="submit">Request Blood</Button>
                      </Col>
                    </Form.Group>
                  </Form>
                </Col>
              </>
          }
        </Row> : 
        <NonVerfiedUser status={user.status}/>
        }
        
      </Container>  
    </>
  )
}
