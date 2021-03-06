import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Paper from '@material-ui/core/Paper';

import { connect } from 'react-redux';
import { getOne, remove } from '../../../redux/actions/books';
import Chip from '@material-ui/core/Chip';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import CustomizedBreadcrumbs from '../components/breadcrumbs';
import FloatingButtonActions from '../components/floating-button-actions';
import { BASE_URL } from '../../../redux/actions/constants'
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import DownloadIcon from 'mdi-material-ui/Download';
import CustomizedLinearProgress  from '../components/progress';
import Checked  from '../components/checked';
import { IconButton }  from '../../blocks/buttons';
import Markdown from '../../blocks/markdown';
import Comments from './comments';
import { getBookState, getBooksLoading } from '../../../redux/root-reducer';
import Helmet from '../../helmet';

const styles = theme => ({
  table: {
    [theme.breakpoints.up('md')]: {
      minWidth: 700,
    }
  },
  th: {
    fontWeight: 700
  },
  card: {
    // maxWidth: 345,
  },
  cardTitle: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 2}px`,
    marginBottom: 5,
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 700
  },
  subtitle: {
    fontWeight: 700,
    marginLeft: 15,
    opacity: 0.5
  },
  breadcrumbs: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    marginBottom: 25
  },
  media: {
    // ⚠️ object-fit is not supported by IE 11.
    objectFit: 'cover',
  },
  image: {
    objectFit: 'cover',
    width: '50%'
  },
  cardRightSidebar: {
    marginBottom: 15
  },
  button: {
    padding: 10
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'center'
  },
  titleRightSidebar: {
    fontWeight: 600,
    fontSize: 25
  },
  chip: {
    borderColor: '#d64444',
    color: '#d64444',
    marginLeft: 15,
    marginTop: -8
  },
});

class Book extends React.Component {
  state = {data: ''}
  componentDidMount() {
      this.props.getOne(this.props.match.params.id).then(d => this.setState({data: d}))
  }
  render() {
    const { classes, loading, history: { push } } = this.props;
    const { data } = this.state;
    if(loading) {
      return <CustomizedLinearProgress />
    }

    return (
      data && !loading ?
      <div className={classes.root}>
        <Helmet title={data.title} />        
        <Grid fluid>
          <Row center="xs">
            <Col xs={12} sm={12} md={12} lg={8} start="xs">
              <CustomizedBreadcrumbs
                text1="Livres"
                link1="/dashboard/livres"
                actualText={data.title}
              />
              <Card className={classes.cardTitle}>
                <Typography variant="title" className={classes.title}>
                  {data.title}
                </Typography>
                {data.author
                ? <Typography variant="title" className={classes.subtitle}>
                    {`${data.author && data.author.first_name} ${data.author && data.author.family_name}`}
                  </Typography>
                :	<Chip
                    label="Pas d'auteur"
                    className={classes.chip}
                    variant="outlined"
                  />}
              </Card>
              <Card className={classes.card}>
              
                <Table className={classes.table}>
                  <TableRow>
                      <TableCell align="right">Titre</TableCell>
                      <TableCell align="left" className={classes.th}>{data.title}</TableCell>
                    </TableRow>
                    { data && data.author && 
                    <TableRow>
                      <TableCell align="right">Auteur</TableCell>
                      <TableCell align="left"  className={classes.th}>{`${data.author.first_name} ${data.author.family_name}`}</TableCell>
                    </TableRow> }
                    { data.date_publication &&
                    <TableRow>
                      <TableCell align="right">Date de publication</TableCell>
                      <TableCell align="left"  className={classes.th}>{data.date_publication}</TableCell>
                    </TableRow> }
                    <TableRow>
                      <TableCell align="right">Ajouté le</TableCell>
                      {/* <TableCell align="left"  className={classes.th}>{moment(new Date(data.createdAt)).fromNow()}</TableCell> */}
                      <TableCell align="left"  className={classes.th}>{moment(new Date(data.createdAt)).format('DD MMMM YYYY à HH:mm')}</TableCell>
                    </TableRow> 
                    { data.updatedAt &&
                    <TableRow>
                      <TableCell align="right">Modifié le</TableCell>
                      <TableCell align="left"  className={classes.th}>{moment(new Date(data.updatedAt)).format('DD MMMM YYYY à HH:mm')}</TableCell>
                    </TableRow> }
                    { data.slug &&
                    <TableRow>
                      <TableCell align="right">Slug</TableCell>
                      <TableCell align="left"  className={classes.th}>{data.slug}</TableCell>
                    </TableRow> }
                    <TableRow>
                      <TableCell align="right">Publier?</TableCell>
                      <TableCell align="left" className={classes.th}><Checked checked={data.publish}/></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="right">Privé?</TableCell>
                      <TableCell align="left" className={classes.th}><Checked checked={data.member}/></TableCell>
                    </TableRow>
                    { data && data.genres && 
                    <TableRow>
                      <TableCell align="right">Genres</TableCell>
                      <TableCell align="left"  className={classes.th}>
                        {data.genres.map(n => (
                           <Chip
                              style={{marginRight: 5}}
                              onClick={() => push(`/dashboard/genre/${n._id}`)}
                              variant="outlined"
                              label={n.name} />
                        ))}
                      </TableCell>
                    </TableRow> }
                    { data.epub && data.epub.data &&
                      <TableRow>
                        <TableCell align="right">Epub</TableCell>
                        <TableCell align="left" className={classes.th}>
                              <a href={`${BASE_URL}/api/books/epub/${data._id}`} style={{textDecoration: 'none'}}>
                                <IconButton label={`DOWNLOAD EPUB (${Number(data.epub.size / (1024 * 1024)).toFixed(3)}Mo)`} icon={<DownloadIcon style={{marginRight: 5}} />}/>
                              </a>                     
                        </TableCell>
                      </TableRow> }
                    { data.pdf && data.pdf.data &&
                      <TableRow>
                        <TableCell align="right">PDF</TableCell>
                        <TableCell align="left" className={classes.th}>
                              <a href={`${BASE_URL}/api/books/pdf/${data._id}`} style={{textDecoration: 'none'}}>
                                <IconButton label={`DOWNLOAD PDF (${Number(data.pdf.size / (1024 * 1024)).toFixed(3)}Mo)`} icon={<DownloadIcon style={{marginRight: 5}} />}/>
                              </a>                     
                        </TableCell>
                      </TableRow> }
                  </Table>

                </Card>
                { data.summary &&<Markdown input={data.summary}/>}
                {data.comments.length > 0
                ? <Comments data={data.comments} bookId={data._id}/> 
                : <Paper style={{padding: 20}}>Il n'y a pas encore de commentaire</Paper>}
              </Col>

              { data.photo || data.author ?
                <Col  xs={12} sm={8} md={8} lg={4} start="xs">
                  { data && data.photo ?
                      <Card className={classes.cardRightSidebar}>
                          <CardMedia
                            component="img"
                            alt={data.title}
                            className={classes.media}
                            height={300}
                            image={`${BASE_URL}/api/books/photo/${data._id}`}
                            title="Contemplative Reptile"
                          />
                      </Card> : null
                  }
                  { data.author && data.author.photo.data &&
                    <Card className={classes.cardRightSidebar}>
                        <CardMedia
                          component="img"
                          alt={data.title}
                          className={classes.media}
                          height={300}
                          image={`${BASE_URL}/api/authors/photo/${data.author._id}`}
                          title={data.author.family_name}
                        />
                      <CardContent>
                        <Typography variant="title" className={classes.titleRightSidebar}>
                          {`${data.author.first_name} ${data.author.family_name}`}
                        </Typography>
                      </CardContent>
                      <CardActions className={classes.cardActions}>
                        <Button
                          size="small"
                          className={classes.button}
                          onClick={() => push(`/dashboard/auteur/${data.author._id}`)}
                          >
                            Voir plus
                          </Button>
                      </CardActions>
                    </Card>
                   }
              </Col> : <CustomizedLinearProgress />
              }
            </Row>
          </Grid>
          <FloatingButtonActions
            name="livre"
            add 
            remove
            edit
            list
            onDelete={() => this.props.remove(data._id)}
            id={data._id}
          />
      </div>
      : <CustomizedLinearProgress />
      
    );
    }
}

Book.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  data: getBookState(state),
  loading: getBooksLoading(state),
});

export default connect(mapStateToProps, { getOne, remove,})(withStyles(styles)(Book))
