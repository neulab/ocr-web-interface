import "./App.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Accordion from "react-bootstrap/Accordion";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import React, { useState } from "react";
import axios from "axios";

function NewlineText(props) {
    const text = props.text;
    const newText = text.split("\n").map((str, index) => (
        <p className="mb-0" key={index}>
            {str}
        </p>
    ));
    return newText;
}

function DisplayImages(props) {
    let imgRenders;
    let downloadButton;

    if (props.imgUploads) {
        downloadButton = (
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Button variant="secondary" onClick={() => handleDownload(props.imgUploads)}>
                        Download OCR Outputs
                    </Button>
                </Col>
            </Row>
        );
        console.log("Uploads exists");
        imgRenders = props.imgUploads.map((img) => {
            return (
                <Accordion.Item eventKey={img["key"]} key={img["key"]}>
                    <Accordion.Header>{img["key"]}</Accordion.Header>
                    <Accordion.Body>
                        <Row>
                            <Col>
                                <Image src={img["url"]} className="img-fluid"></Image>
                            </Col>
                            <Col>
                                <NewlineText text={img["text"]} />
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>
            );
        });
    }

    function handleDownload(imgUploads) {
        let elements = [];
        for (let i = 0; i < imgUploads.length; i++) {
            const element = document.createElement("a");
            const file = new Blob([imgUploads[i]["text"]], { type: "text/plain" });
            element.href = URL.createObjectURL(file);
            element.download = imgUploads[i]["key"].replace("png", "txt");
            elements[i] = element;
        }
        console.log(elements);

        for (let i = 0; i < elements.length; i++) {
            document.body.appendChild(elements[i]);
            elements[i].click();
            document.body.removeChild(elements[i]);
        }
        console.log("done");
    }

    return (
        <>
            <Row className="my-2">{downloadButton}</Row>
            <Row>
                <Accordion defaultActiveKey="-1">{imgRenders}</Accordion>
            </Row>
        </>
    );
}

function OCRForm(props) {
    return (
        <Form className="my-5" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="auto">
                    <Form.Select onChange={props.handleSystemSelect}>
                        {/* <option value="" disabled>Choose an OCR system</option> */}
                        <option value="google">Google Vision</option>
                        <option value="tesseract" disabled>Tesseract</option>
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="fileUploader">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect}  required={true}/>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Upload
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

function PostCorrInferenceForm(props) {
    return (
        <Form className="my-5" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="auto">
                    <Form.Group controlId="trainData">
                        <Form.Control type="file" onChange={props.handleModelFileSelect} required={true}/>
                        <Form.Label className="mt-2">Model File</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="unlabeledData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleUnlabeledFileSelect} required={true}/>
                        <Form.Label className="mt-2">First-pass OCR</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Apply model
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

function PostCorrTrainingForm(props) {
    return (
        <Form className="my-5" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="auto">
                    <Form.Group controlId="trainData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleLabeledFileSelect} required={true}/>
                        <Form.Label className="mt-2">Training Data</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="unlabeledData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleUnlabeledFileSelect} />
                        <Form.Label className="mt-2">Unlabeled Data</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Train new model
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

function PostCorrInference() {
    const [modelFile, setModelFile] = useState();
    const [unlabeledFiles, setUnlabeledFiles] = useState();
    const [email, setEmail] = useState();
    const [textMessage, setTextMessage] = useState();

    function handleSubmit(e) {
        e.preventDefault();
        console.log("You clicked upload on the post-correction prediction form.");

        // Add code to send modelFile, unlabeledFiles, email to the backend and get monitoring URL.

        const url = "toy_monitoring_url/job_id"

        setTextMessage(<><p className="mb-0" key="0">
                Post-correction job submitted!
                </p>
                <p className="mb-0" key="1">
                Monitor the status of your job <a href={url}>here</a>.
                </p>
                <p className="mb-0" key="2">
                When the job is complete, an email with the link to download the post-corrected text files will be sent to your email address.
                </p></>);
}

    function handleModelFileSelect(e) {
        e.preventDefault();
        console.log("You selected model file on the post-correction inference form.");
        setModelFile(e.target.files);
    }

    function handleUnlabeledFileSelect(e) {
        e.preventDefault();
        console.log("You selected unlabeled data files on the post-correction inference form.");
        setUnlabeledFiles(e.target.files);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value);
    }

    return (
        <Container>
            <Row>
                <Accordion>
                    <Accordion.Item eventKey="predict" key="predict">
                        <Accordion.Header>Correct errors using a trained model</Accordion.Header>
                        <Accordion.Body>
                            <Container>
                                <Row className="justify-content-center">
                                    <Col xs="auto">
                                        <PostCorrInferenceForm handleSubmit={handleSubmit} handleModelFileSelect={handleModelFileSelect} handleUnlabeledFileSelect={handleUnlabeledFileSelect} handleEmailChange={handleEmailChange} />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center text-success">
                                    {textMessage}
                                </Row>
                            </Container>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Row>
        </Container>
    )
}

function PostCorrTraining() {
    const [labeledFiles, setLabeledFiles] = useState();
    const [unlabeledFiles, setUnlabeledFiles] = useState();
    const [email, setEmail] = useState();
    const [textMessage, setTextMessage] = useState();

    function handleSubmit(e) {
        e.preventDefault();
        console.log("You clicked upload on the post-correction training form.");

        // Add code to send labeledFiles, unlabeledFiles, email to the backend and get monitoring URL.

        const url = "toy_monitoring_url/job_id"

        setTextMessage(<><p className="mb-0" key="0">
                Training data submitted!
                </p>
                <p className="mb-0" key="1">
                Monitor the status of your model training job <a href={url}>here</a>.
                </p>
                <p className="mb-0" key="2">
                When training is complete, an email with the link to download the model will be sent to your email address.
                </p></>);
    }

    function handleLabeledFileSelect(e) {
        e.preventDefault();
        console.log("You selected labeled data files on the post-correction training form.");
        setLabeledFiles(e.target.files);
    }

    function handleUnlabeledFileSelect(e) {
        e.preventDefault();
        console.log("You selected unlabeled data files on the post-correction training form.");
        setUnlabeledFiles(e.target.files);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value);
    }

    return (
        <Container>
            <Row>
                <Accordion className="pb-3">
                    <Accordion.Item eventKey="train" key="train">
                        <Accordion.Header>Train a new post-correction model</Accordion.Header>
                        <Accordion.Body>
                            <Container>
                                <Row className="justify-content-center">
                                    <Col xs="auto">
                                        <PostCorrTrainingForm handleSubmit={handleSubmit} handleLabeledFileSelect={handleLabeledFileSelect} handleUnlabeledFileSelect={handleUnlabeledFileSelect} handleEmailChange={handleEmailChange} />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center text-success">
                                    {textMessage}
                                </Row>
                            </Container>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Row>
        </Container>
    )
}

function OCR() {
    const [files, setFiles] = useState();
    const [imgUploads, setUploads] = useState();
    const [email, setEmail] = useState();
    const [textMessage, setTextMessage] = useState();
    const [ocrSystem, setSystem] = useState("google"); // ocrSystem variable is updated with the form, but not used in processing. It can be used for adding systems in the future.
    //const url = "http://rabat.sp.cs.cmu.edu:8088/annotator/ocr-post-correction/";
    var url = "http://localhost:8088/annotator/ocr-post-correction/";

    function handleSubmit(e) {
        e.preventDefault();
        console.log("You clicked upload on the OCR form.");

        setTextMessage("Processing files...");

        let imgArr = [];

        const formData = new FormData();

        if (window.submit_url !== undefined) {
            url = window.submit_url
        }

        if (window.debug === undefined) {
            window.debug = 1;
        }
        formData.append("params", '{"debug": ' + window.debug + '}');
        formData.append("email", email);
        for (let i = 0; i < files.length; i++) {
            formData.append("file", files[i]);
            formData.append("fileName", files[i].name);

            imgArr[i] = { key: files[i].name, name: files[i].name, url: URL.createObjectURL(files[i]), text: "" };
        }

        var auth_token = "8470ede027588b80c5b82ab5c9e78b8daea68635";
        if (window.auth_token !== undefined) {
            auth_token = window.auth_token
        }
        const config = {
            headers: {
                "content-type": "multipart/form-data",
                //Authorization: "5e72d818c2f4250687f090bb7ec5466184982edc",
                Authorization: auth_token,
            },
        };

        axios.post(url, formData, config).then((response) => {
            console.log(response.data);

            if (Array.isArray(response.data)) {
                setTextMessage(JSON.stringify(response.data));
            } else {
                let i = 0;
                for (let key in response.data) {
                    // response.data[key] = "Test\nTest\nTest" + key;
                    let value = response.data[key];
                    imgArr[i]["text"] = value;
                    i += 1;
                }
                setUploads(imgArr);
                setTextMessage("");
            }
        });
    }

    function handleFileSelect(e) {
        e.preventDefault();
        console.log("You selected files on the OCR form.");
        setFiles(e.target.files);
    }

    function handleSystemSelect(e) {
        e.preventDefault();
        console.log("You chose a system.");
        setSystem(e.target.value);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value);
    }

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <OCRForm handleSubmit={handleSubmit} handleFileSelect={handleFileSelect} handleSystemSelect={handleSystemSelect} handleEmailChange={handleEmailChange}/>
                </Col>
            </Row>
            <Row className="justify-content-center fs-5 text-danger">
                {textMessage}
            </Row>
            <DisplayImages imgUploads={imgUploads} />
        </Container>
    );
}

function App() {
    return (
        <div className="App">
            <Tabs defaultActiveKey="ocr" transition={false} id="uncontrolled-tab" className="mb-3">
                <Tab eventKey="ocr" title="Off-the-shelf OCR">
                    <OCR></OCR>
                </Tab>
                <Tab eventKey="post" title="Automatic Post-correction">
                    <PostCorrTraining></PostCorrTraining>
                    <PostCorrInference></PostCorrInference>
                </Tab>
            </Tabs>
        </div>
    );
}

export default App;

