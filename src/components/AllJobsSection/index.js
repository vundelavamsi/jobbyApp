import './index.css'

import {Component} from 'react'
import {BsSearch} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'

import ProfileSection from '../ProfileSection'
import FiltersGroup from '../FiltersGroup'
import JobItem from '../JobItem'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class AllJobsSection extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    searchInput: '',
    employmentTypes: [],
    salaryRange: '',
    allJobsData: [],
  }

  componentDidMount() {
    this.getAlljobsData()
  }

  getAlljobsData = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const {searchInput, employmentTypes, salaryRange} = this.state
    const employmentTypesJoined = employmentTypes.join(',')
    // console.log(employmentTypesJoined)

    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypesJoined}&minimum_package=${salaryRange}&search=${searchInput}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)

    if (response.ok === true) {
      const fetchedData = await response.json()
      //   console.log(fetchedData)
      const updatedData = fetchedData.jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))

      this.setState({
        allJobsData: updatedData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  selectemploymentType = event => {
    const {value, checked} = event.target
    const {employmentTypes} = this.state

    if (checked === true) {
      this.setState(
        {
          employmentTypes: [...employmentTypes, value],
        },
        this.getAlljobsData,
      )
    } else {
      const updatedTypes = employmentTypes.filter(
        eachType => eachType !== value,
      )

      this.setState(
        {
          employmentTypes: updatedTypes,
        },
        this.getAlljobsData,
      )
    }
  }

  selectSalaryRange = event => {
    const {value} = event.target

    this.setState(
      {
        salaryRange: value,
      },
      this.getAlljobsData,
    )
  }

  onChangeSearchInput = event => {
    this.setState({
      searchInput: event.target.value,
    })
  }

  onClickSearch = () => this.getAlljobsData()

  renderSearchBar = () => {
    const {searchInput} = this.state
    return (
      <div className="search-bar">
        <input
          value={searchInput}
          type="search"
          className="search-input"
          placeholder="Search"
          onChange={this.onChangeSearchInput}
        />
        <button
          onClick={this.onClickSearch}
          className="search-icon-button"
          type="button"
          data-testid="searchButton"
          aria-label="Search"
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  renderSuccessView = () => {
    const {allJobsData} = this.state
    const shouldShowJobsList = allJobsData.length > 0
    // console.log(allJobsData)

    return shouldShowJobsList ? (
      <div className="job-section-success-view">
        <ul className="job-cards-container">
          {allJobsData.map(eachCard => (
            <JobItem key={eachCard.id} jobDetails={eachCard} />
          ))}
        </ul>
      </div>
    ) : (
      <div className="no-jobs-view">
        <img
          className="no-jobs-img"
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
        />
        <h1 className="no-jobs-error">No Jobs Found</h1>
        <p className="no-jobs-message">
          We could not find any jobs. Try other filters.
        </p>
      </div>
    )
  }

  onRetryButton = () => {
    this.getAlljobsData()
  }

  renderFailureView = () => (
    <div className="job-section-failure-view">
      <img
        className="job-section-failure-image"
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1 className="job-section-failure-error">Oops! Something Went Wrong</h1>
      <p className="job-section-failure-message">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        className="job-section-failure-retry-btn"
        onClick={this.onRetryButton}
      >
        Retry
      </button>
    </div>
  )

  renderLoadingView = () => (
    <div data-testid="loader" className="all-jobs-loader-container">
      <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
    </div>
  )

  renderAllJobsView = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    const {employmentTypes, salaryRange} = this.state
    return (
      <div className="all-jobs-section">
        <div className="profile-and-filters-container">
          {this.renderSearchBar()}
          <ProfileSection />
          <hr className="horizontal-line" />
          <FiltersGroup
            employmentTypes={employmentTypes}
            salaryRange={salaryRange}
            selectemploymentType={this.selectemploymentType}
            selectSalaryRange={this.selectSalaryRange}
            employmentTypesList={employmentTypesList}
            salaryRangesList={salaryRangesList}
          />
        </div>
        <div className="jobs-section-container">{this.renderAllJobsView()}</div>
      </div>
    )
  }
}

export default AllJobsSection
