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
                    <Form.Select aria-label="Default select example">
                        <option>Choose an OCR system</option>
                        <option value="1">Google Vision</option>
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="fileUploader">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect} />
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

function PostCorrForm(props) {
    return (
        <Form className="my-5" onSubmit={props.handleSubmit}>
            <Row className="pb-5">
                <Col xs="auto">
                    <Form.Group controlId="trainData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect} />
                        <Form.Label class="mt-2">Training Data</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="unlabData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect} />
                        <Form.Label class="mt-2">Unlabeled Data</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Train new model
                    </Button>
                </Col>
            </Row>
            <Row className="pt-5">
                <Col xs="auto">
                    <Form.Group controlId="trainData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect} />
                        <Form.Label class="mt-2">Model File</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="unlabData">
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect} />
                        <Form.Label class="mt-2">First-pass OCR</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Predict
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

function App() {
    const [files, setFiles] = useState();
    const [imgUploads, setUploads] = useState();
    const url = "http://rabat.sp.cs.cmu.edu:8088/annotator/ocr-post-correction/";

    function handleSubmit(e) {
        e.preventDefault();
        console.log("You clicked upload.");

        let imgArr = [];

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("file", files[i]);
            formData.append("fileName", files[i].name);
            formData.append("params", '{"debug": 0}');

            imgArr[i] = { key: files[i].name, name: files[i].name, url: URL.createObjectURL(files[i]), text: "" };
        }

        const config = {
            headers: {
                "content-type": "multipart/form-data",
                Authorization: "c5ec0b461153ff993f8d1160ad032428c6f458c0",
            },
        };

        axios.post(url, formData, config).then((response) => {
            console.log(response.data);

            let i = 0;

            for (let key in response.data) {
                // response.data[key] = "Test\nTest\nTest" + key;
                let value = response.data[key];
                imgArr[i]["text"] = value;
                i += 1;
            }
            setUploads(imgArr);
        });
    }

    function handleFileSelect(e) {
        e.preventDefault();
        console.log("You selected files.");
        setFiles(e.target.files);
    }

    return (
        <div className="App">
            <Tabs defaultActiveKey="ocr" transition={false} id="uncontrolled-tab" className="mb-3">
                <Tab eventKey="ocr" title="Off-the-shelf OCR">
                    <Container>
                        <Row className="justify-content-center">
                            <Col xs="auto">
                                <OCRForm handleSubmit={handleSubmit} handleFileSelect={handleFileSelect} />
                            </Col>
                        </Row>
                        <DisplayImages imgUploads={imgUploads} />
                    </Container>
                </Tab>
                <Tab eventKey="post" title="Post-correction">
                    <Container>
                        <Row className="justify-content-center">
                            <Col xs="auto">
                                <PostCorrForm handleSubmit={handleSubmit} handleFileSelect={handleFileSelect} />
                            </Col>
                        </Row>
                    </Container>
                </Tab>
            </Tabs>
        </div>
    );
}

export default App;
