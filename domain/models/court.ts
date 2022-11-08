import {
  COURT_TYPE_ASPHALTCOAT,
  COURT_TYPE_CLAYCOAT,
  COURT_TYPE_CONCRETECOAT,
  COURT_TYPE_GRASSCOAT,
  COURT_TYPE_SANDCOAT,
  COURT_TYPE_STREETCOAT,
} from '../../constants/constants';

export interface Court {
  court_type: number;
  court_name: string;
}
